import * as client from 'openid-client'
import * as open from 'open';  // Static import at the top
import * as http from 'http'
import { URL } from 'url'
import { ConfigProvider } from 'providers/config/provider'

export class AuthClient {
  private readonly redirectPort = 3080 // Port for the local callback server
  private readonly configProvider: ConfigProvider

  constructor(params: {
    configProvider: ConfigProvider
  }) {
    this.configProvider = params.configProvider
  }

  /** Runs the OAuth2 flow to authenticate the user and returns an API key that can be used
   * with the API to interact with the user's resources.
   */
  async getAPIKey(): Promise<string> {
    // Check if we already have an API key from environment variables
    const existingApiKey = this.configProvider.getConfig().apiKey
    if (existingApiKey) {
      return existingApiKey
    }

    // Otherwise, we'll need to go through the auth flow to get an access token
    // and then exchange it for an API key
    const accessToken = await this.refreshAuthenticationState()

    // TODO: Exchange the access token for an API key by calling your backend
    // This is just a placeholder; you'll need to implement the actual API call
    const apiKey = await this.exchangeAccessTokenForApiKey(accessToken)
    const updatedConfig = this.configProvider.getConfig()
    updatedConfig.apiKey = apiKey

    // Update the config with the new API key
    await this.configProvider.updateConfig(updatedConfig)

    return apiKey
  }

  /** Refreshes the underlying JWT provided by the provider and caches it for a short time
   * in order to get the API KEY to interact with the user's resources.
   */
  async refreshAuthenticationState(): Promise<string> {
    // Check if we already have a valid access token
    const existingToken = this.configProvider.getConfig().accessToken
    if (existingToken) {
      // TODO: Check if token is expired
      // For now, we'll just return it
      return existingToken
    }

    // Set up a local server to receive the callback
    const { server, codePromise } = this.createLocalServer()

    try {
      // Discover OpenID configuration
      console.log('Discovering OAuth provider...')
      const config = await client.discovery(
        new URL(this.configProvider.getConfig().oauth2DiscoveryEndpoint),
        this.configProvider.getConfig().oauth2ClientId
      )

      // Generate PKCE parameters
      const code_verifier = client.randomPKCECodeVerifier()
      const code_challenge =
        await client.calculatePKCECodeChallenge(code_verifier)

      // Always generate a state parameter for CSRF protection
      const state = client.randomState()

      // Build the redirect URL with appropriate parameters
      const redirect_uri = `http://localhost:${this.redirectPort}/oauth/openid/callback`
      const parameters: Record<string, string> = {
        redirect_uri,
        scope: 'openid profile email',
        code_challenge,
        code_challenge_method: 'S256',
        state // Always include state parameter
      }

      // Build the authorization URL
      const redirectTo = client.buildAuthorizationUrl(config, parameters)

      // Open the browser for the user to authenticate
      console.log('Please open this URL in your browser to authenticate:')
      console.log(redirectTo.href)

      try {
        await open.default(redirectTo.href)
        console.log('Browser opened automatically.')
      } catch (error) {
        console.log(
          'Unable to open browser automatically. Please copy the URL manually.'
        )
      }

      // Wait for the callback
      console.log('Waiting for authentication...')
      const callbackUrl = await codePromise

      // Exchange the authorization code for tokens
      console.log('Exchanging code for tokens...')
      const tokens = await client.authorizationCodeGrant(config, callbackUrl, {
        pkceCodeVerifier: code_verifier,
        expectedState: state // Always verify the state parameter
      })

      // TODO: Remove this from the log.
      console.log('Authentication successful!', tokens)

      // Store the access token in the config
      const updatedConfig = this.configProvider.getConfig()
      updatedConfig.accessToken = tokens.access_token
      await this.configProvider.updateConfig(updatedConfig)

      // Return the access token
      return tokens.access_token
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      console.error('Authentication failed:', errorMessage)
      throw error
    } finally {
      // Ensure server is closed
      server.close()
    }
  }

  /**
   * Creates a local HTTP server to handle the OAuth callback
   */
  private createLocalServer() {
    // Create a server to handle the callback
    const server = http.createServer()

    // Create a promise that will resolve with the callback URL
    const codePromise = new Promise<URL>((resolve, reject) => {
      // Set a timeout
      const timeoutId = setTimeout(() => {
        reject(new Error('Authentication timed out'))
        server.close()
      }, 120000) // 2 minute timeout

      server.on('request', (req, res) => {
        try {
          if (!req.url) {
            throw new Error('Request URL is undefined')
          }

          // Parse the callback URL
          const callbackUrl = new URL(req.url, `http://${req.headers.host}`)

          // Parse the URL params and check for errors.
          if (callbackUrl.searchParams.has('error')) {
            const error = callbackUrl.searchParams.get('error')
            const errorDescription =
              callbackUrl.searchParams.get('error_description') ||
              'Unknown error'

            // Send an error response
            res.writeHead(400, { 'Content-Type': 'text/html' })
            res.end(`
                            <html>
                                <body>
                                    <h1>Authentication Failed</h1>
                                    <p>Error: ${error}</p>
                                    <p>${errorDescription}</p>
                                    <p>Please close this window and try again.</p>
                                </body>
                            </html>
                        `)

            reject(
              new Error(`Authentication error: ${error} - ${errorDescription}`)
            )
          } else if (callbackUrl.searchParams.has('code')) {
            // Auth was successful, resolve the promise - ?code=...
            clearTimeout(timeoutId)
            resolve(callbackUrl)

            // Send a success response
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(`
                            <html>
                                <body>
                                    <h1>Authentication Successful</h1>
                                    <p>You can close this window and return to the CLI.</p>
                                    <script>setTimeout(function() { window.close(); }, 2000);</script>
                                </body>
                            </html>
                        `)
          } else {
            // No code parameter found
            res.writeHead(400, { 'Content-Type': 'text/html' })
            res.end(`
                            <html>
                                <body>
                                    <h1>Authentication Failed</h1>
                                    <p>No authorization code was received.</p>
                                    <p>Please close this window and try again.</p>
                                </body>
                            </html>
                        `)

            reject(new Error('No authorization code received'))
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : String(err)

          // Send an error response
          res.writeHead(500, { 'Content-Type': 'text/html' })
          res.end(`
                        <html>
                            <body>
                                <h1>Authentication Failed</h1>
                                <p>Error: ${errorMessage}</p>
                                <p>Please close this window and try again.</p>
                            </body>
                        </html>
                    `)

          reject(new Error(`Error processing callback: ${errorMessage}`))
        }
      })

      // Start the server
      server.listen(this.redirectPort, () => {
        console.log(
          `Local authentication server listening on port ${this.redirectPort}`
        )
      })
    })

    return { server, codePromise }
  }

  /**
   * Exchanges an access token for an API key by calling the backend service
   */
  private async exchangeAccessTokenForApiKey(
    accessToken: string
  ): Promise<string> {
    // TODO: Implement the actual API call to exchange the access token for an API key
    // This is a placeholder implementation
    console.log('Exchanging access token for API key...')

    // Make a request to your backend with the access token
    // Example:
    // const response = await fetch('https://api.yourdomain.com/exchange-token', {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': `Bearer ${accessToken}`,
    //         'Content-Type': 'application/json'
    //     }
    // });
    // const data = await response.json();
    // return data.apiKey;

    // For now, just returning a mock API key
    return `api_${accessToken.substring(0, 8)}`
  }
}

export default AuthClient
