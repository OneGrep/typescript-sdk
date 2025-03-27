import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class Identity {
    userId: string;
    email?: string; // If this identity is associated with a human user, this is their authentication email.

    constructor(params: {
        userId: string;
        email?: string;
    }) {
        this.userId = params.userId;
        this.email = params.email;
    }
}

export class Config {
    apiKey?: string;
    accessToken?: string;
    identity?: Identity;

    constructor(params: {
        apiKey?: string;
        accessToken?: string;
        identity?: Identity;
    }) {
        this.apiKey = params.apiKey;
        this.accessToken = params.accessToken;
        this.identity = params.identity;
    }
}

/** Responsible for providing the runtime configuration for the CLI that is comprised of
 * any locally cached data that is needed in order to interact with the user's resources.
 * 
 * It is responsible for managing the lifecycle of the user's cached config data including items such as:
 * - API Keys
 * - Ephemeral JWTs
 * - User's profile data
 */
export class ConfigProvider {
    private config: Config;
    private readonly configDir: string;
    private readonly configFile: string;

    // List of configuration keys that should not be persisted to disk
    private readonly nonPersistentKeys: Array<keyof Config> = ['apiKey'];

    constructor() {
        // Load environment variables from .env file
        dotenv.config();

        // Set up paths for config storage
        this.configDir = path.join(os.homedir(), '.onegrep');
        this.configFile = path.join(this.configDir, 'config.json');

        // Initialize with empty config
        this.config = new Config({});

        // Load configuration (from env and/or persisted config)
        this.loadConfig();
    }

    /**
     * Loads configuration from environment variables and persisted config
     */
    private loadConfig(): void {
        // First try to load from persisted config
        const persistedConfig = this.getConfigFromUserDir();

        // Then load from environment variables (taking precedence over persisted)
        this.config = new Config({
            // API key is only loaded from environment, never from persisted storage
            apiKey: process.env.ONEGREP_API_KEY,

            // Access token can come from persisted config if not in environment
            accessToken: process.env.ONEGREP_ACCESS_TOKEN || persistedConfig?.accessToken,

            // Identity information comes from persisted config
            identity: persistedConfig?.identity
        });
    }

    /**
     * Updates the configuration and persists relevant parts to disk
     */
    async updateConfig(config: Partial<Config>): Promise<void> {
        // Update in-memory config
        this.config = {
            ...this.config,
            ...config
        };

        // Persist config to disk (excluding blacklisted properties)
        await this.persistConfig();
    }

    /**
     * Creates a filtered version of the config containing only persistent values
     */
    private getPersistentConfig(): Partial<Config> {
        // Create a copy of the config
        const configCopy = { ...this.config } as any;

        // Remove non-persistent keys
        for (const key of this.nonPersistentKeys) {
            delete configCopy[key];
        }

        return configCopy;
    }

    /**
     * Persists configuration to the user's home directory
     */
    private async persistConfig(): Promise<void> {
        try {
            // Get config with only persistent values
            const persistentConfig = this.getPersistentConfig();

            // Ensure the directory exists
            if (!fs.existsSync(this.configDir)) {
                fs.mkdirSync(this.configDir, { recursive: true });
            }

            // Write the config to file
            fs.writeFileSync(
                this.configFile,
                JSON.stringify(persistentConfig, null, 2),
                'utf8'
            );
        } catch (error) {
            console.error('Failed to persist configuration:', error);
        }
    }

    /**
     * Loads configuration from the user's home directory if it exists
     */
    getConfigFromUserDir(): Config | undefined {
        try {
            if (fs.existsSync(this.configFile)) {
                const fileContent = fs.readFileSync(this.configFile, 'utf8');
                const parsed = JSON.parse(fileContent);

                // Reconstruct identity if it exists
                if (parsed.identity) {
                    parsed.identity = new Identity(parsed.identity);
                }

                return new Config(parsed);
            }
        } catch (error) {
            console.error('Failed to read configuration from user directory:', error);
        }
        return undefined;
    }

    /**
     * Gets the current configuration
     */
    getConfig(): Config {
        return this.config;
    }

    /**
     * Gets the API key from the configuration
     */
    getApiKey(): string | undefined {
        return this.config.apiKey;
    }

    /**
     * Gets the access token from the configuration
     */
    getAccessToken(): string | undefined {
        return this.config.accessToken;
    }

    /**
     * Gets the user identity from the configuration
     */
    getIdentity(): Identity | undefined {
        return this.config.identity;
    }

    /**
     * Gets the user email from the configuration
     */
    getUserEmail(): string | undefined {
        return this.config.identity?.email;
    }
}