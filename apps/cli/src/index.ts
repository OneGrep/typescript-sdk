import { healthcheck } from './commands/healthcheck'
import { getAuditLogs } from './commands/audit'
import { Command } from 'commander'
import { chalk, logger } from './utils/logger'

import { version } from '../package.json'
import { toolsCommand } from 'commands/tools'
import { clearTerminal } from 'utils/helpers'
import { ConfigProvider } from 'providers/config/provider'
import AuthzProvider from 'providers/auth/provider'
import { createAccountCommand } from 'commands/account'

async function validateAuthenticationState(authProvider: AuthzProvider) {
  if (!(await authProvider.isAuthenticated())) {
    logger.log('You are current unauthenticated. Run the following command to authenticate:')
    logger.log(`$> ${chalk.bold.green('onegrep-cli')} account login\n\n`)
  }
}

async function main() {
  clearTerminal()
  const configProvider = new ConfigProvider()
  await configProvider.init()

  // Create auth client
  const authProvider = new AuthzProvider({
    configProvider
  })

  logger.debug(`Config: ${configProvider.getConfig().modelDumpJSON()}`)

  const cli = new Command()
    .name('onegrep-cli')
    .description(
      'Use the OneGrep CLI to debug and manage your OneGrep Toolbox.'
    )
    .version(version || '0.0.1')
    .option('--debug', 'Enable debug mode', false)
    .hook('preAction', async () => {
      await validateAuthenticationState(authProvider)
    })

  cli.addCommand(healthcheck)
  cli.addCommand(getAuditLogs)
  cli.addCommand(toolsCommand)
  cli.addCommand(createAccountCommand({ configProvider, authProvider }))

  cli.parse()
}

// Instead of await main() - we do this because we are outputting a CJS module which does not support top-level awaits.
void main().catch((err) => {
  logger.error(`Error running CLI: ${err}`)
  process.exit(1)
})
