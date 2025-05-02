import { dummyLogger, Logger } from 'ts-log'
import { LogLevelDesc } from 'loglevel'
import { z } from 'zod'

import { consoleLogger } from './loggers/console.js'
import { fileLogger } from './loggers/file.js'
import { multiLogger } from './loggers/multi.js'

import { getEnv, loggingEnvSchema, logModes } from './env.js'

function silentLogger(): Logger {
  return dummyLogger
}

export async function getLogger(
  logMode: z.infer<typeof logModes>,
  loggerName?: string,
  logLevelName?: string
): Promise<Logger> {
  let logger: Logger

  // Convert the string log level to a LogLevelDesc (so consumers don't need to import loglevel)
  const logLevelDesc = logLevelName as LogLevelDesc | undefined

  if (logMode === 'off') {
    logger = silentLogger()
  } else if (logMode === 'console') {
    logger = consoleLogger(loggerName, logLevelDesc)
  } else if (logMode === 'file') {
    logger = await fileLogger(loggerName, logLevelDesc)
  } else if (logMode === 'all') {
    const allLoggers: Logger[] = [
      consoleLogger(loggerName, logLevelDesc),
      await fileLogger(loggerName, logLevelDesc)
    ]
    logger = multiLogger(allLoggers)
  } else {
    throw new Error(`Unsupported log mode: ${logMode}`)
  }

  return logger
}

export let log: Logger = silentLogger()

function initRootLogger(): void {
  const env = getEnv(loggingEnvSchema)

  getLogger(env.LOG_MODE, undefined, env.LOG_LEVEL)
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
