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

/**
 * Creates the account command with subcommands for authentication and account management
 * @param authClient The authentication client to use
 * @returns The configured account command
 */
export function createAccountCommand(authClient: AuthzProvider): Command {
  const accountCommand = new Command('account').description(
    'Manage your OneGrep account and authentication'
  )

  // Login command
  accountCommand
    .command('login')
    .description('Authenticate with OneGrep')
    .action(async () => {
      try {
        const spinner = getSpinner('Authenticating with OneGrep...')
        spinner.start()

        // Invoke the authentication flow
        const apiKey = await authClient.getAPIKey()

        spinner.succeed('Authentication successful!')

        logger.info(chalk.green(`You are now logged in to OneGrep`))
        if (apiKey) {
          logger.info(chalk.dim(`API Key: ${apiKey.substring(0, 5)}...`))
        }
      } catch (error) {
        logger.error(
          `Authentication failed: ${error instanceof Error ? error.message : String(error)}`
        )
        process.exit(1)
      }
    })

  // TODO: Add logout command
  // TODO: Add profile command to view account details

  return accountCommand
}
