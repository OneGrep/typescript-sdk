import * as client from 'openid-client'
import * as open from 'open' // Static import at the top
import * as http from 'http'
import { URL } from 'url'
import { ConfigProvider } from 'providers/config/provider'
import { OAuth2Config } from 'providers/config/models'
import { isDefined } from 'utils/helpers'

export class AuthzProvider {
  private readonly redirectPort = 3080 // Port for the local callback server
  private readonly configProvider: ConfigProvider

  constructor(params: { configProvider: ConfigProvider }) {
    this.configProvider = params.configProvider
  }

  /**
   * Updates environment variables with new token values
   */
  private updateEnvVars(): void {
    // Update process.env directly
    process.env.ONEGREP_ACCESS_TOKEN = this.configProvider.getConfig().auth?.accessToken
    process.env.ONEGREP_API_KEY = this.configProvider.getConfig().identity?.apiKey
  }

  isAuthenticated(): boolean {
    // If we already have an api key, no need to go through an auth flow.
    if (isDefined(this.configProvider.getConfig().identity?.apiKey)) {
      return true
    }

    // Check the authentication state of our OAuth2 config.
    const oauth2Config = this.configProvider.getConfig().auth
    if (!oauth2Config) {
      return false
    }

    return !oauth2Config!.isTokenExpired()
  }

  /** Refreshes the underlying JWT provided by the provider and caches it for a short time
   * in order to get the API KEY to interact with the user's resources.
   */
  async refreshAuthenticationState(): Promise<void> {
    const config = this.configProvider.getConfig()
    const oauth2Config = config.auth || new OAuth2Config()

    // Check if we already have a valid access token and an API key.
    if (this.isAuthenticated()) {
      return
    }

    // Set up a local server to receive the callback
    const { server, codePromise } = this.createLocalServer()

    try {
      // Discover OpenID configuration
      console.log('Discovering OAuth provider...')
      const oidcConfig = await client.discovery(
        new URL(oauth2Config.discoveryEndpoint),
        oauth2Config.clientId
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
      const redirectTo = client.buildAuthorizationUrl(oidcConfig, parameters)

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
      const tokens = await client.authorizationCodeGrant(oidcConfig, callbackUrl, {
        pkceCodeVerifier: code_verifier,
        expectedState: state // Always verify the state parameter
      })

      // TODO: Remove this from the log.
      console.log('Authentication successful!', tokens)

      // Store token information in the config
      const updatedConfig = this.configProvider.getConfig()

      if (!updatedConfig.auth) {
        updatedConfig.auth = new OAuth2Config()
      }

      updatedConfig.auth.updateState({
        access_token: tokens.access_token,
        expires_in: tokens.expires_in,
        id_token: tokens.id_token
      })

      await this.configProvider.updateConfig(updatedConfig)
      await this.exchangeAccessTokenForApiKey()

      this.updateEnvVars()
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
   * Exchanges an access token for an API key by calling the backend service then updates the
   * local config with the API Key for usage across boundaries.
   */
  private async exchangeAccessTokenForApiKey(): Promise<void> {
    // TODO: Implement the actual API call to exchange the access token for an API key
    // This is a placeholder implementation
    console.log('Exchanging access token for API key...')
  }
}

export default AuthzProvider
