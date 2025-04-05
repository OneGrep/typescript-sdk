/** Command set for authentication and account management operations. */
import { Command } from 'commander'
import { chalk, logger } from '../utils/logger'
import { clearTerminal, getSpinner, isDefined } from '../utils/helpers'
import {
  getToolbox,
  ToolResource,
  ToolCallInput,
  ToolCallError,
  JsonSchema,
  Toolbox,
  ToolNameFilter
} from '@onegrep/sdk'
import { select, input, confirm, checkbox } from '@inquirer/prompts'
import Table from 'cli-table3'
import { highlight } from 'cli-highlight'
import AuthzProvider from '../providers/auth/provider'
import { ConfigProvider } from 'providers/config/provider'

/**
 * Creates the account command with subcommands for authentication and account management
 * @param authProvider The authentication client to use
 * @returns The configured account command
 */
export function createAccountCommand(params: { configProvider: ConfigProvider, authProvider: AuthzProvider }): Command {
  const accountCommand = new Command('account').description(
    'Manage your OneGrep account and authentication'
  )

  const { configProvider, authProvider } = params

  // Login command
  accountCommand
    .command('login')
    .description('Authenticate with OneGrep')
    .action(async () => {
      try {
        const spinner = getSpinner('Authenticating with OneGrep...')
        spinner.start()

        if (await authProvider.isAuthenticated()) {
          logger.log(chalk.green('You are already authenticated.'))
          const choice = await confirm({
            message: 'Would you like to re-authenticate?',
            default: false
          })

          if (!choice) {
            return
          }
        }


        // Invoke the authentication flow
        const authenticated = await authProvider.initOAuthFlow(true)

        if (!authenticated) {
          logger.error('Authentication failed. Please try again.')
          return
        }

        spinner.succeed('Authentication successful!')
        configProvider.saveConfig()

        logger.log(`Run ${chalk.bold.blue('onegrep-cli help')} to get started.`)
      } catch (error) {
        logger.error(
          `Authentication failed: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    })

  // TODO: Add logout command
  // TODO: Add profile command to view account details

  return accountCommand
}
