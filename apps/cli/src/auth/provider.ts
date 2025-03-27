import * as client from 'openid-client'
import * as http from 'http'
import { URL } from 'url'

class AuthProvider {
    private readonly oauth2ProviderUrl: string;
    private readonly clientId = 'cli-client'; // Replace with your actual client ID
    private readonly redirectPort = 8000; // Port for the local callback server

    constructor(config: {
        oauth2ProviderUrl: string;
    }) {
        this.oauth2ProviderUrl = config.oauth2ProviderUrl;
    }

    /** Runs the OAuth2 flow to authenticate the user and returns an access token that can be used
     * with the API to interact with the user's resources.
     */
    async getAPIKey() {
        return this.refreshAuthenticationState();
    }

    /** Refreshes the underlying JWT provided by the provider and caches it for a short time
     * in order to get the API KEY to interact with the user's resources.
     */
    async refreshAuthenticationState(): Promise<string> {
        // Set up a local server to receive the callback
        const { server, codePromise } = this.createLocalServer();

        try {
            // Discover OpenID configuration
            console.log('Discovering OAuth provider...');
            const config = await client.discovery(
                new URL(this.oauth2ProviderUrl),
                this.clientId,
                '' // Client secret is not needed for PKCE flow
            );

            // Generate PKCE parameters
            const code_verifier = client.randomPKCECodeVerifier();
            const code_challenge = await client.calculatePKCECodeChallenge(code_verifier);
            let state: string | undefined;

            // Build the redirect URL with appropriate parameters
            const redirect_uri = `http://localhost:${this.redirectPort}`;
            const parameters: Record<string, string> = {
                redirect_uri,
                scope: 'openid profile email',
                code_challenge,
                code_challenge_method: 'S256',
            };

            // Add state parameter if needed
            if (!config.serverMetadata().supportsPKCE()) {
                state = client.randomState();
                parameters.state = state;
            }

            // Build the authorization URL
            const redirectTo = client.buildAuthorizationUrl(config, parameters);

            // Open the browser for the user to authenticate
            console.log('Please open this URL in your browser to authenticate:');
            console.log(redirectTo.href);

            try {
                const open = await import('open');
                await open.default(redirectTo.href);
                console.log('Browser opened automatically.');
            } catch (error) {
                console.log('Unable to open browser automatically. Please copy the URL manually.');
            }

            // Wait for the callback
            console.log('Waiting for authentication...');
            const callbackUrl = await codePromise;

            // Exchange the authorization code for tokens
            console.log('Exchanging code for tokens...');
            const tokens = await client.authorizationCodeGrant(
                config,
                callbackUrl,
                {
                    pkceCodeVerifier: code_verifier,
                    expectedState: state,
                }
            );

            console.log('Authentication successful!');

            // Return the access token
            return tokens.access_token;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('Authentication failed:', errorMessage);
            throw error;
        } finally {
            // Ensure server is closed
            server.close();
        }
    }

    private createLocalServer() {
        // Create a server to handle the callback
        const server = http.createServer();

        // Create a promise that will resolve with the callback URL
        const codePromise = new Promise<URL>((resolve, reject) => {
            // Set a timeout
            const timeoutId = setTimeout(() => {
                reject(new Error('Authentication timed out'));
                server.close();
            }, 120000); // 2 minute timeout

            server.on('request', (req, res) => {
                try {
                    if (!req.url) {
                        throw new Error('Request URL is undefined');
                    }

                    // Parse the callback URL
                    const callbackUrl = new URL(req.url, `http://${req.headers.host}`);

                    // Check for errors
                    if (callbackUrl.searchParams.has('error')) {
                        const error = callbackUrl.searchParams.get('error');
                        const errorDescription = callbackUrl.searchParams.get('error_description') || 'Unknown error';

                        // Send an error response
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        res.end(`
                            <html>
                                <body>
                                    <h1>Authentication Failed</h1>
                                    <p>Error: ${error}</p>
                                    <p>${errorDescription}</p>
                                    <p>Please close this window and try again.</p>
                                </body>
                            </html>
                        `);

                        reject(new Error(`Authentication error: ${error} - ${errorDescription}`));
                    } else if (callbackUrl.searchParams.has('code')) {
                        // Auth was successful, resolve the promise
                        clearTimeout(timeoutId);
                        resolve(callbackUrl);

                        // Send a success response
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(`
                            <html>
                                <body>
                                    <h1>Authentication Successful</h1>
                                    <p>You can close this window and return to the CLI.</p>
                                    <script>setTimeout(function() { window.close(); }, 2000);</script>
                                </body>
                            </html>
                        `);
                    } else {
                        // No code parameter found
                        res.writeHead(400, { 'Content-Type': 'text/html' });
                        res.end(`
                            <html>
                                <body>
                                    <h1>Authentication Failed</h1>
                                    <p>No authorization code was received.</p>
                                    <p>Please close this window and try again.</p>
                                </body>
                            </html>
                        `);

                        reject(new Error('No authorization code received'));
                    }
                } catch (err) {
                    const errorMessage = err instanceof Error ? err.message : String(err);

                    // Send an error response
                    res.writeHead(500, { 'Content-Type': 'text/html' });
                    res.end(`
                        <html>
                            <body>
                                <h1>Authentication Failed</h1>
                                <p>Error: ${errorMessage}</p>
                                <p>Please close this window and try again.</p>
                            </body>
                        </html>
                    `);

                    reject(new Error(`Error processing callback: ${errorMessage}`));
                }
            });

            // Start the server
            server.listen(this.redirectPort, () => {
                console.log(`Local authentication server listening on port ${this.redirectPort}`);
            });
        });

        return { server, codePromise };
    }
}

export default AuthProvider;
