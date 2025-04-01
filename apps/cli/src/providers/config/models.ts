import { SerializableModel } from 'providers/models'
import { z } from 'zod'

// Define the schema
const IdentitySchema = z.object({
    userId: z.string(),
    email: z.string().optional()
})

export class Identity extends SerializableModel<z.infer<typeof IdentitySchema>> {
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
const ConfigSchema = z.object({
    apiKey: z.string().optional(),
    accessToken: z.string().optional(),
    identity: IdentitySchema.optional()
})

export class Config extends SerializableModel<z.infer<typeof ConfigSchema>> {
    constructor(
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
            validated.data.apiKey,
            validated.data.accessToken,
            validated.data.identity ? Identity.modelValidate(validated.data.identity) : undefined
        )
    }
}
