import { z } from 'zod'

import { getEnv, getLogger, loggingSchema } from '@repo/utils'

export const sdkLoggingSchema = z
  .object({
    ONEGREP_SDK_LOG_LEVEL: z.string().default('info')
  })
  .merge(loggingSchema)

const env = getEnv(sdkLoggingSchema)

/**
 * The child logger for the onegrep-sdk.
 */
export const log = getLogger(
  env.LOG_MODE,
  'onegrep-sdk',
  env.ONEGREP_SDK_LOG_LEVEL
)
