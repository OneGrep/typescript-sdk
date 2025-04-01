import { SerializableModel } from 'providers/models'
import { isDefined } from 'utils/helpers'
import { z } from 'zod'

const _AUTHZ_DEFAULTS = {
    openIdDiscoveryEndpoint: 'https://640272695.propelauthtest.com/.well-known/openid-configuration',
    clientId: '65382374d2a3a54262161587a24efd04'
}

// Define the schema
export const IdentitySchema = z.object({
    userId: z.string(),
    email: z.string().optional()
})

export class Identity extends SerializableModel<
    z.infer<typeof IdentitySchema>
> {
    constructor(
        public userId: string,
        public email?: string // If this identity is associated with a human user, this is their authentication email.
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

        return new Identity(validated.data.userId, validated.data.email)
    }
}

// Define the schema for Config
export const ConfigSchema = z.object({
    oauth2DiscoveryEndpoint: z.string().url().optional().transform((v) => {
        if (isDefined(v)) return v

        if (isDefined(process.env.ONEGREP_OAUTH2_PROVIDER_URL)) {
            return process.env.ONEGREP_OAUTH2_PROVIDER_URL
        }

        return _AUTHZ_DEFAULTS.openIdDiscoveryEndpoint
    }),
    oauth2ClientId: z.string().optional().transform((v) => {
        if (isDefined(v)) return v

        if (isDefined(process.env.ONEGREP_OAUTH2_CLIENT_ID)) {
            return process.env.ONEGREP_OAUTH2_CLIENT_ID
        }

        return _AUTHZ_DEFAULTS.clientId
    }),
    apiKey: z.string().optional().transform((v) => { return isDefined(v) ? v : process.env.ONEGREP_API_KEY }),
    accessToken: z.string().optional().transform((v) => { return isDefined(v) ? v : process.env.ONEGREP_ACCESS_TOKEN }),
    identity: IdentitySchema.optional()
})

export class Config extends SerializableModel<z.infer<typeof ConfigSchema>> {
    constructor(
        public oauth2DiscoveryEndpoint: string = _AUTHZ_DEFAULTS.openIdDiscoveryEndpoint,
        public oauth2ClientId: string = _AUTHZ_DEFAULTS.clientId,
        public apiKey?: string,
        public accessToken?: string,
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
            validated.data.oauth2DiscoveryEndpoint,
            validated.data.oauth2ClientId,
            validated.data.apiKey,
            validated.data.accessToken,
            validated.data.identity
                ? Identity.modelValidate(validated.data.identity)
                : undefined
        )
    }
}
