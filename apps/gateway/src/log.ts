import { z } from 'zod'

import { loggingSchema, getEnv, getLogger } from '@repo/utils'

export const gatewayLoggingSchema = loggingSchema.extend({
  ONEGREP_GATEWAY_LOG_LEVEL: z.string().default('info')
})

const initGatewayLogger = () => {
  const env = getEnv(gatewayLoggingSchema)

  return getLogger(env.LOG_MODE, 'gateway', env.ONEGREP_GATEWAY_LOG_LEVEL)
}

/**
 * The child logger for the onegrep-gateway.
 */
export const log = initGatewayLogger()
