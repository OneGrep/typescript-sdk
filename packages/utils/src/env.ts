import { z } from 'zod'
import 'dotenv/config'

export const nodeEnv = z.object({
  NODE_ENV: z
    .union([
      z.literal('test'),
      z.literal('development'),
      z.literal('production')
    ])
    .default('development')
})

export const loggingSchema = z.object({
  LOG_MODE: z.enum(['off', 'console', 'file', 'all']).default('off'),
  LOG_LEVEL: z.string().default('info')
})

export const sdkLoggingSchema = z.object({
  ONEGREP_SDK_LOG_LEVEL: z.string().default('info')
})

export const sdkApiSchema = z.object({
  ONEGREP_API_KEY: z.string().optional(),
  ONEGREP_API_URL: z.string().url().default('https://test-sandbox.onegrep.dev')
})

export const loggingEnvSchema = nodeEnv
  .merge(loggingSchema)
  .merge(sdkLoggingSchema)

export const envSchema = loggingEnvSchema.merge(sdkApiSchema)

/**
 * Get the environment variables for the given schema.
 * @param envSchema - The schema to get the environment variables for.
 * @returns The environment variables for the given schema in a Zod inferred type.
 */
export function getEnv<T extends z.ZodSchema>(envSchema: T): z.infer<T> {
  return envSchema.parse(process.env)
}

/**
 * Get the issues from the environment variables for the given schema.
 * Use at the beginning of your program to check if the environment variables are valid.
 * @param envSchema - The schema to get the issues from the environment variables for.
 * @returns The issues from the environment variables for the given schema.
 */
export const getEnvIssues = <T extends z.ZodSchema>(
  envSchema: T
): z.ZodIssue[] | void => {
  const result = envSchema.safeParse(process.env)
  if (!result.success) return result.error.issues
}
