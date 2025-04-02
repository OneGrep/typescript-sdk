import { SerializableModel } from 'providers/models'
import { isDefined } from 'utils/helpers'
import { z } from 'zod'

const _AUTHZ_DEFAULTS = {
  openIdDiscoveryEndpoint:
    'https://640272695.propelauthtest.com/.well-known/openid-configuration',
  clientId: '65382374d2a3a54262161587a24efd04'
}

// Schema for the OneGrep Identity that is being used to interact with resources.
export const IdentitySchema = z.object({
  userId: z.string(),
  email: z.string().optional(),
  apiKey: z
    .string()
    .optional()
    .transform((v) => {
      if (isDefined(v)) return v

      if (isDefined(process.env.ONEGREP_API_KEY)) {
        return process.env.ONEGREP_API_KEY
      }

      return undefined
    })
  // profileId, etc.
})

export class Identity extends SerializableModel<
  z.infer<typeof IdentitySchema>
> {
  constructor(
    public userId: string,
    public email?: string, // If this identity is associated with a human user, this is their authentication email.
    public apiKey?: string // If this identity is associated with a human user, this is their API key.
  ) {
    super()
  }

  modelDump(): z.infer<typeof IdentitySchema> {
    return IdentitySchema.parse(this)
  }

  static modelValidate(data: unknown): Identity {
    const validated = IdentitySchema.safeParse(data)

    if (!validated.success) {
      throw new Error(`Failed to validate identity: ${validated.error}`)
    }

    return new Identity(
      validated.data.userId,
      validated.data.email,
      validated.data.apiKey
    )
  }
}

// Define the OAuth2 configuration schema
export const OAuth2Schema = z.object({
  discoveryEndpoint: z
    .string()
    .url()
    .optional()
    .transform((v) => {
      if (isDefined(v)) return v

      if (isDefined(process.env.ONEGREP_OAUTH2_PROVIDER_URL)) {
        return process.env.ONEGREP_OAUTH2_PROVIDER_URL
      }

      return _AUTHZ_DEFAULTS.openIdDiscoveryEndpoint
    }),
  clientId: z
    .string()
    .optional()
    .transform((v) => {
      if (isDefined(v)) return v

      if (isDefined(process.env.ONEGREP_OAUTH2_CLIENT_ID)) {
        return process.env.ONEGREP_OAUTH2_CLIENT_ID
      }

      return _AUTHZ_DEFAULTS.clientId
    }),
  accessToken: z
    .string()
    .optional()
    .transform((v) => {
      return isDefined(v) ? v : process.env.ONEGREP_ACCESS_TOKEN
    }),
  expiresIn: z.number().optional(),
  idToken: z.string().optional()
})

/**
 * Configuration for OAuth2 authentication.
 *
 * Design Decision: We intentionally do not store refresh tokens.
 * This is a security-focused decision to minimize attack vectors from long-lived tokens.
 * When access tokens expire, users will need to re-authenticate.
 *
 * This may change in the future when we implement secure refresh token storage
 * using the system keychain.
 */
export class OAuth2Config extends SerializableModel<
  z.infer<typeof OAuth2Schema>
> {
  constructor(
    public discoveryEndpoint: string = _AUTHZ_DEFAULTS.openIdDiscoveryEndpoint,
    public clientId: string = _AUTHZ_DEFAULTS.clientId,
    public accessToken?: string,
    public expiresIn?: number,
    public idToken?: string
  ) {
    super()
  }

  modelDump(): z.infer<typeof OAuth2Schema> {
    return OAuth2Schema.parse(this)
  }

  static modelValidate(data: unknown): OAuth2Config {
    const validated = OAuth2Schema.safeParse(data)

    if (!validated.success) {
      throw new Error(`Failed to validate OAuth2 config: ${validated.error}`)
    }

    return new OAuth2Config(
      validated.data.discoveryEndpoint,
      validated.data.clientId,
      validated.data.accessToken,
      validated.data.expiresIn,
      validated.data.idToken
    )
  }

  /**
   * Checks if the current access token is expired or about to expire
   * @param bufferSeconds Number of seconds before expiry to consider the token as expired
   * @returns boolean indicating if the token is expired or about to expire
   */
  isTokenExpired(bufferSeconds: number = 60): boolean {
    if (!isDefined(this.accessToken)) {
      return true
    }

    if (!isDefined(this.expiresIn)) {
      return true
    }

    const now = Math.floor(Date.now() / 1000) // Current time in seconds
    const tokenIssuedAt = now - this.expiresIn! // Approximate time token was issued
    const expiryTime = tokenIssuedAt + this.expiresIn!

    return now >= expiryTime - bufferSeconds
  }

  /**
   * Updates the token information with new values. Forces the caller to provide
   * all the necessary information in order to avoid partial incorrect updates.
   *
   * @param params Token response from the authorization server
   */
  updateState(params: {
    access_token: string
    expires_in?: number
    id_token?: string
  }): void {
    this.accessToken = params.access_token
    if (params.expires_in) {
      this.expiresIn = params.expires_in
    }
    if (params.id_token) {
      this.idToken = params.id_token
    }
  }
}

// Define the schema for Config
export const ConfigSchema = z.object({
  auth: OAuth2Schema.optional(),
  identity: IdentitySchema.optional()
})

export class Config extends SerializableModel<z.infer<typeof ConfigSchema>> {
  constructor(
    public auth?: OAuth2Config,
    public identity?: Identity
  ) {
    super()
  }

  modelDump(): z.infer<typeof ConfigSchema> {
    return ConfigSchema.parse(this)
  }

  static modelValidate(data: unknown): Config {
    const validated = ConfigSchema.safeParse(data)

    if (!validated.success) {
      throw new Error(`Failed to validate config: ${validated.error}`)
    }

    return new Config(
      validated.data.auth
        ? OAuth2Config.modelValidate(validated.data.auth)
        : undefined,
      validated.data.identity
        ? Identity.modelValidate(validated.data.identity)
        : undefined
    )
  }
}
