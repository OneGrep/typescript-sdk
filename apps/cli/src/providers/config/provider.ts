import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { Config, Identity, OAuth2Config } from './models'
import { isDefined } from 'utils/helpers'

/** Responsible for providing the runtime configuration for the CLI that is comprised of
 * any locally cached data that is needed in order to interact with the user's resources.
 *
 * It is responsible for managing the lifecycle of the user's cached config data including items such as:
 * - API Keys
 * - Ephemeral JWTs
 * - User's profile data
 */
export class ConfigProvider {
  private config: Config
  private readonly userCfgDir: string
  private readonly userCfgPath: string

  constructor() {
    // Load environment variables from .env file
    dotenv.config()

    // Set up paths for config storage
    // TODO: update - os.homedir()
    this.userCfgDir = path.join('/Users/achintyaashok/Downloads', '.onegrep')
    this.userCfgPath = path.join(this.userCfgDir, 'config.json')

    // Initialize with empty config
    this.config = new Config()
  }

  // We cannot make a constructor async so we initialize separately.
  async init(): Promise<void> {
    await this.loadConfig()
  }

  /**
   * Returns a read-only reference to the current config. The caller should only use
   * explicit setters to update this.
   */
  getConfig(): Readonly<Config> {
    return this.config
  }

  /**
   * Updates the auth state of the config.
   */
  updateAuthState(params: {
    access_token: string
    expires_in?: number
    id_token?: string
  }) {
    if (!this.config.auth) {
      this.config.auth = new OAuth2Config()
    }

    this.config.auth.updateState(params)
    this.updateEnvVars()
  }

  /**
   * Updates the identity of the config.
   */
  updateIdentity(params: {
    userId?: string
    email?: string
    apiKey?: string
  }) {
    if (!this.config.identity) {
      this.config.identity = new Identity()
    }

    this.config.identity.update(params)
    this.updateEnvVars()
  }

  /**
   * Loads configuration from environment variables and persisted config
   */
  private async loadConfig(): Promise<void> {
    let persistedConfig: string | undefined

    // First try to load from persisted config
    if (fs.existsSync(this.userCfgPath)) {
      persistedConfig = fs.readFileSync(this.userCfgPath, 'utf8')
      try {
        this.config = Config.modelValidateJSON(persistedConfig!)
      } catch (error) {
        console.error(
          'Failed to validate config. Not updating with persisted config.',
          error
        )
      }
    }

    if (isDefined(persistedConfig)) {
      try {
        this.config = Config.modelValidateJSON(persistedConfig!)
      } catch (error) {
        console.error(
          'Failed to validate config. Not updating with persisted config.',
          error
        )
      }
    } else {
      // Stub out our config with empty values.
      await this.persistConfig()
    }
  }

  /**
   * Creates a filtered version of the config containing only persistent values
   */
  private generatePersistableConfigObject(): object {
    let cfgDump = this.config.modelDump()

    // Remove sensitive keys from our config before making it persistable.
    if (isDefined(cfgDump.identity)) {
      cfgDump.identity!.apiKey = undefined
    }

    return { ...cfgDump } as Record<string, unknown>
  }

  /**
   * Persists configuration to the user's home directory
   */
  private async persistConfig(): Promise<void> {
    try {
      // Get config with only persistent values
      const persistentConfig = this.generatePersistableConfigObject()

      // Ensure the directory exists
      if (!fs.existsSync(this.userCfgDir)) {
        fs.mkdirSync(this.userCfgDir, { recursive: true })
      }

      // Write the config to file
      fs.writeFileSync(
        this.userCfgPath,
        JSON.stringify(persistentConfig, null, 2),
        'utf8'
      )
    } catch (error) {
      console.error('Failed to persist configuration:', error)
    }
  }

  private updateEnvVars() {
    // Update process.env directly
    process.env.ONEGREP_ACCESS_TOKEN =
      this.config.auth?.accessToken
    process.env.ONEGREP_API_KEY =
      this.config.identity?.apiKey
  }
}
