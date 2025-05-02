import { dummyLogger, Logger } from 'ts-log'
import { LogLevelDesc } from 'loglevel'
import { z } from 'zod'

import { consoleLogger } from './loggers/console.js'
import { getEnv, loggingEnvSchema } from './env.js'

type LoggingEnv = z.infer<typeof loggingEnvSchema>

function silentLogger(): Logger {
  return dummyLogger
}

async function getLoggerFromEnv(
  env: LoggingEnv,
  loggerName?: string,
  logLevel?: LogLevelDesc
): Promise<Logger> {
  let logger: Logger
  if (env.LOG_MODE === 'off') {
    logger = silentLogger()
  } else if (env.LOG_MODE === 'console') {
    logger = consoleLogger(loggerName, logLevel)
  } else {
    throw new Error(`Invalid log mode: ${env.LOG_MODE}`)
  }

  return logger
}

export let log: Logger = silentLogger()

function initRootLogger(): void {
  const env = getEnv(loggingEnvSchema)
  getLoggerFromEnv(env)
    .then((logger) => {
      log = logger
    })
    .catch((error) => {
      log = consoleLogger()
      log.error(
        'Failed to initialize requested logger, using console logger',
        error
      )
    })
  log.info('Logger initialized')
}

initRootLogger()
