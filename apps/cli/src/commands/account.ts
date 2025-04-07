/** Command set for authentication and account management operations. */
import { Command } from 'commander'
import { chalk, logger } from '../utils/logger'
import { clearTerminal, getSpinner, isDefined } from '../utils/helpers'
import { select, input, confirm, checkbox } from '@inquirer/prompts'
import Table from 'cli-table3'
import AuthzProvider from '../providers/auth/provider'
import { ConfigProvider } from 'providers/config/provider'

export function outputAuthenticationPrompt() {
  logger.log('\n\nYou are not authenticated.')
  logger.log(`Please run ${chalk.bold.blue('onegrep-cli account login')} to authenticate.\n\n`)
}

/**
 * Ensures API URL is set before proceeding with auth operations
 * @returns true if API URL is set (either already or by user input)
 */
async function validateApiUrl(
  configProvider: ConfigProvider
): Promise<boolean> {
  const currentUrl = configProvider.getConfig().identity?.apiUrl

  if (!currentUrl) {
    logger.info(
      chalk.yellow('API URL is not set. You need to set it before proceeding.')
    )
    const apiUrl = await input({
      message: 'Enter the API URL:',
      default: 'https://test-sandbox.onegrep.dev',
      validate: (value) => {
        if (!value.trim()) return 'API URL is required'
        try {
          new URL(value) // Validate URL format
          return true
        } catch (e) {
          return 'Please enter a valid URL'
        }
      }
    })

    // Update the config with the API URL
    configProvider.updateIdentity({ apiUrl })
    configProvider.saveConfig()

    logger.log(chalk.green('API URL updated successfully!'))
    return true
  }

  return true
}

/**
 * Handles account creation using an invitation code
 */
async function handleAccountCreation(params: {
  authProvider: AuthzProvider
  configProvider: ConfigProvider
}) {
  const spinner = getSpinner('Creating your account...')

  try {
    // Ensure API URL is set first
    if (!(await validateApiUrl(params.configProvider))) {
      return
    }

    logger.info('Create a new OneGrep account with an invitation code')

    const invitationCode = await input({
      message: 'Enter your invitation code:',
      validate: (value) => {
        if (!value.trim()) return 'Invitation code is required'
        return true
      }
    })

    spinner.start()

    // Invoke the authentication flow with the invitation code
    const authenticated = await params.authProvider.initOAuthFlow({
      reauthenticate: true,
      invitationCode: invitationCode
    })

    if (!authenticated) {
      spinner.fail(
        'Account creation failed. Please check your invitation code and try again.'
      )
      process.exit(1)
    }

    spinner.succeed('Account created successfully!')
    params.configProvider.saveConfig()

    logger.log(`Run ${chalk.bold.blue('onegrep-cli help')} to get started.`)
  } catch (error) {
    // Force stop the spinner in case it's still running
    spinner.stop()
    logger.error(
      `Account creation failed: ${error instanceof Error ? error.message : String(error)}`
    )
    // Exit with error code to prevent hanging
    process.exit(1)
  }
}

/**
 * Handles setting an API key manually
 */
async function handleApiKeyInput(params: { configProvider: ConfigProvider }) {
  try {
    // Ensure API URL is set first
    if (!(await validateApiUrl(params.configProvider))) {
      return
    }

    logger.info('Set your OneGrep API key')

    const apiKey = await input({
      message: 'Enter your API key:',
      validate: (value) => {
        if (!value.trim()) return 'API key is required'
        return true
      }
    })

    // Update the config with the API key
    params.configProvider.updateIdentity({ apiKey })
    params.configProvider.saveConfig()

    logger.log(chalk.green('API key saved successfully!'))
    logger.log(`Run ${chalk.bold.blue('onegrep-cli help')} to get started.`)
  } catch (error) {
    logger.error(
      `Failed to save API key: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Handles setting the API URL
 */
async function handleApiUrlInput(params: { configProvider: ConfigProvider }) {
  try {
    const currentUrl = params.configProvider.getConfig().identity?.apiUrl

    if (currentUrl) {
      logger.info(`Current API URL: ${chalk.cyan(currentUrl)}`)
      const changeUrl = await confirm({
        message: 'Do you want to change the API URL?',
        default: false
      })

      if (!changeUrl) {
        return
      }
    } else {
      logger.info('No API URL set. Setting a new API URL.')
    }

    const newApiUrl = await input({
      message: 'Enter the API URL:',
      default: currentUrl || 'https://test-sandbox.onegrep.dev',
      validate: (value) => {
        if (!value.trim()) return 'API URL is required'
        try {
          new URL(value) // Validate URL format
          return true
        } catch (e) {
          return 'Please enter a valid URL'
        }
      }
    })

    params.configProvider.updateIdentity({ apiUrl: newApiUrl })
    params.configProvider.saveConfig()
    logger.log(chalk.green('API URL updated successfully!'))
  } catch (error) {
    logger.error(
      `Failed to update API URL: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Handles the standard login flow
 */
async function handleLogin(params: {
  authProvider: AuthzProvider
  configProvider: ConfigProvider
}) {
  const spinner = getSpinner('Authenticating with OneGrep...')

  try {
    // Ensure API URL is set first
    if (!(await validateApiUrl(params.configProvider))) {
      return
    }

    spinner.start()

    if (await params.authProvider.isAuthenticated()) {
      spinner.stop()
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
    const authenticated = await params.authProvider.initOAuthFlow({
      reauthenticate: true
    })

    if (!authenticated) {
      spinner.fail('Authentication failed. Please try again.')
      return
    }

    spinner.succeed('Authentication successful!')
    params.configProvider.saveConfig()

    logger.log(`Run ${chalk.bold.blue('onegrep-cli help')} to get started.`)
  } catch (error) {
    // Force stop the spinner in case it's still running
    spinner.stop()
    logger.error(
      `Authentication failed: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Handles the logout flow
 */
async function handleLogout(params: { configProvider: ConfigProvider }) {
  try {
    const purgeApiUrl = await confirm({
      message: `Would you also like to clear your configured API URL (${params.configProvider.getConfig().identity?.apiUrl})?`,
      default: false
    })

    const confirmed = await confirm({
      message: 'Are you sure you want to log out? This will clear all your credentials and you will need to re-authenticate.',
      default: false
    })

    if (!confirmed) {
      logger.info('Logout cancelled.')
      return
    }

    // Clear auth state
    params.configProvider.clearAuthState()
    params.configProvider.clearIdentity(purgeApiUrl)
    params.configProvider.saveConfig()

    logger.log(chalk.green('Logged out successfully.'))
  } catch (error) {
    logger.error(
      `Logout failed: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

async function handleAccountStatus(params: {
  configProvider: ConfigProvider
  authProvider: AuthzProvider
}) {
  const spinner = getSpinner('Checking account status...')

  try {
    // For status command, we don't require API URL validation as we just want to show current status
    spinner.start()

    let isAuthenticated = false
    try {
      isAuthenticated = await params.authProvider.isAuthenticated()
    } catch (error) {
      logger.debug(`Authentication check failed: ${error}`)
    }

    const config = params.configProvider.getConfig()

    spinner.stop()

    const statusTable = new Table({
      style: {
        head: [],
        border: []
      },
      wordWrap: true,
      colWidths: [20, 60]
    })

    statusTable.push(
      [
        chalk.blueBright('Status:'),
        isAuthenticated
          ? chalk.green('Authenticated')
          : chalk.red('Not authenticated')
      ],
      [
        chalk.blueBright('API URL:'),
        config.identity?.apiUrl || chalk.red('Not set')
      ]
    )

    if (config.identity?.email) {
      statusTable.push([chalk.blueBright('Email:'), config.identity.email])
    }

    if (config.identity?.userId) {
      statusTable.push([chalk.blueBright('User ID:'), config.identity.userId])
    }

    if (config.identity?.apiKey) {
      statusTable.push([chalk.blueBright('API Key:'), '[REDACTED]'])
    }

    logger.log(statusTable.toString())

    if (!isAuthenticated) {
      outputAuthenticationPrompt()
    }
  } catch (error) {
    // Force stop the spinner in case it's still running
    spinner.stop()
    logger.error(
      `Failed to retrieve account status: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

async function handleAccountSetup(params: {
  configProvider: ConfigProvider
  authProvider: AuthzProvider
}) {
  try {
    clearTerminal()
    logger.info(chalk.bold.blueBright('OneGrep Account Setup'))

    // First check if we have an API URL, if not, set it
    const hasApiUrl = await validateApiUrl(params.configProvider)
    if (!hasApiUrl) {
      return
    }

    // Now show the account setup options
    const option = await select({
      message: 'Select an option:',
      choices: [
        {
          name: 'Create an account (I have an invitation code)',
          value: 'create-account'
        },
        {
          name: 'I have an API Key',
          value: 'api-key'
        },
        {
          name: 'Set my API URL',
          value: 'api-url'
        },
        {
          name: 'Go back',
          value: 'back'
        }
      ]
    })

    switch (option) {
      case 'create-account':
        await handleAccountCreation(params)
        break
      case 'api-key':
        await handleApiKeyInput(params)
        break
      case 'api-url':
        await handleApiUrlInput(params)
        break
      case 'back':
        logger.info('Operation cancelled.')
        break
    }
  } catch (error) {
    logger.error(
      `Setup failed: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

/**
 * Creates the account command with subcommands for authentication and account management
 * @param authProvider The authentication client to use
 * @returns The configured account command
 */
export function getAccountsCommand(params: {
  configProvider: ConfigProvider
  authProvider: AuthzProvider
}): Command {
  const accountCommand = new Command('account').description(
    'Manage your OneGrep account and authentication'
  )

  // Setup command
  accountCommand
    .command('setup')
    .description('Set up your OneGrep account')
    .action(async () => {
      await handleAccountSetup(params)
    })

  // Set API URL command
  accountCommand
    .command('set-url')
    .description('Set or update the API URL')
    .action(async () => {
      await handleApiUrlInput(params)
    })

  // Login command
  accountCommand
    .command('login')
    .description('Authenticate with OneGrep')
    .action(async () => {
      await handleLogin(params)
    })

  // Logout command
  accountCommand
    .command('logout')
    .description('Log out from OneGrep')
    .action(async () => {
      await handleLogout(params)
    })

  // Status command to view account details
  accountCommand
    .command('status')
    .description('View your account status and details')
    .action(async () => {
      await handleAccountStatus(params)
    })

  return accountCommand
}
