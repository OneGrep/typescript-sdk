import { dummyLogger, Logger } from 'ts-log'
import { Env, getEnv } from './env'
import { getPinoLogger } from './pino'

export function getNoOpLogger(): Logger {
  return dummyLogger
}

class ConsoleLogger implements Logger {
  trace(message?: any, ...optionalParams: any[]): void {
    console.trace(message, ...optionalParams)
  }

  debug(message?: any, ...optionalParams: any[]): void {
    console.debug(message, ...optionalParams)
  }

  info(message?: any, ...optionalParams: any[]): void {
    console.info(message, ...optionalParams)
  }

  warn(message?: any, ...optionalParams: any[]): void {
    console.warn(message, ...optionalParams)
  }

  error(message?: any, ...optionalParams: any[]): void {
    console.error(message, ...optionalParams)
  }

  [x: string]: any // Allow for additional properties
}

export function getConsoleLogger(): Logger {
  return new ConsoleLogger()
}

async function getLoggerFromEnv(env: Env): Promise<Logger> {
  try {
    return await getPinoLogger(env)
  } catch (error) {
    console.warn('Unable to initialize pino logger', error)
    return getConsoleLogger()
  }
}

export let log: Logger = getNoOpLogger()

export function initLogger(): void {
  const env = getEnv()
  getLoggerFromEnv(env)
    .then((logger) => {
      log = logger
      log.info('Logger initialized')
    })
    .catch((error) => {
      console.error('Failed to initialize logger', error)
      log = getNoOpLogger()
    })
}

initLogger()
