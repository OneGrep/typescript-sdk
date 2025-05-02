import { dummyLogger, Logger } from 'ts-log'
import { LogLevelDesc } from 'loglevel'
import { z } from 'zod'

import { consoleLogger } from './loggers/console.js'
import { fileLogger } from './loggers/file.js'
import { multiLogger } from './loggers/multi.js'

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
  } else if (env.LOG_MODE === 'file') {
    logger = await fileLogger(loggerName, logLevel)
  } else if (env.LOG_MODE === 'all') {
    const allLoggers: Logger[] = [
      consoleLogger(loggerName, logLevel),
      await fileLogger(loggerName, logLevel)
    ]
    logger = multiLogger(allLoggers)
  } else {
    throw new Error(`Unsupported log mode: ${env.LOG_MODE}`)
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
        'Failed to initialize requested log mode, using console log mode',
        error
      )
    })
  log.info('Root logger initialized')
}

initRootLogger()
