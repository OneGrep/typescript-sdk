import { Command } from 'commander'
import { chalk, logger } from '../utils/logger'
import { getSpinner, isDefined } from 'utils/helpers'
import { getToolbox, ToolResource } from '@onegrep/sdk'

/**
 * Fetches audit logs with the specified pagination options
 */
async function attemptToolRun(options: {
  integration: string
  tool: string
  getSchema: boolean
  dryRun: boolean
  params: string
}) {
  const spinner = getSpinner('Setting up toolbox...', 'yellow')
  spinner.start()
  const toolbox = await getToolbox()
  spinner.succeed('Toolbox setup complete')

  const toolResources: Array<ToolResource> = await toolbox.listAll()

  // Find the tools for the given integration
  const integrationTools = toolResources.filter(
    (tool) => tool.metadata.integrationName === options.integration
  )

  // Find the tool with the given name
  const cleanedToolName = options.tool.trim()
  const tool: ToolResource | undefined = integrationTools.find(
    (tool) => tool.metadata.name === cleanedToolName
  )

  if (!isDefined(tool)) {
    await toolbox.close()
    throw new Error(
      `Tool ${options.tool} not found in integration ${options.integration}.\nAvailable tools: ${integrationTools.map((t) => t.metadata.name).join(', ')}`
    )
  }

  if (options.getSchema) {
    const schema = tool!.metadata.inputSchema
    logger.log(chalk.greenBright.bgBlackBright(JSON.stringify(schema, null, 2)))
  }

  await toolbox.close()
}

async function listTools(options: { integration?: string }) {
  const toolbox = await getToolbox()
  const toolResources: Array<ToolResource> = await toolbox.listAll()

  const toolsByIntegration: Record<string, string[]> = {}
  toolResources.forEach((tool) => {
    if (!toolsByIntegration[tool.metadata.integrationName]) {
      toolsByIntegration[tool.metadata.integrationName] = []
    }
    toolsByIntegration[tool.metadata.integrationName].push(tool.metadata.name)
  })

  if (!isDefined(options.integration)) {
    // Just list out all the integrations and their tools in a bulleted list.
    // Print out the integrations and their tools in a bulleted list:
    // > Integration Name
    //   - Tool 1
    //   - Tool 2
    //   - Tool 3
    //
    // > Integration Name
    //   - Tool 1
    //   - Tool 2

    Object.entries(toolsByIntegration).forEach(([integration, tools]) => {
      logger.log(chalk.bold.blueBright(`> ${integration}`))
      tools.forEach((tool) => {
        logger.log(chalk.blueBright(`\t- ${tool}`))
      })
      logger.log('\n')
    })

    await toolbox.close()

    return
  }

  if (!toolsByIntegration[options.integration!]) {
    throw new Error(
      `Integration ${options.integration} not found. Available integrations: ${Object.keys(toolsByIntegration).join(', ')}`
    )
  }

  const tools = toolsByIntegration[options.integration!]
  // Print it out in a bulleted list.
  logger.log(chalk.bold.blueBright(`${options.integration}`))
  tools.forEach((tool) => {
    logger.log(chalk.blueBright(`\t- ${tool}`))
  })

  await toolbox.close()
}

export const runTool = new Command()
  .name('run-tool')
  .aliases(['t'])
  .description('Run a tool from an available integration')
  .option('-i, --integration <string>', 'Integration to run the tool from')
  .option('-t, --tool <string>', 'Tool to run')
  .option('-s --get-schema', 'Get the schema for the tool', false)
  .option('-p, --params <string>', 'Parameters to pass to the tool')
  .option(
    '--dry-run',
    'Dry run the tool. This will output the payload that would be sent to the tool',
    false
  )
  .action(async (options) => {
    await attemptToolRun(options)
  })

export const listIntegrations = new Command()
  .name('list')
  .aliases(['lt'])
  .description('List all tools from an available integration')
  .option('-i, --integration <string>', 'Integration to list tools from')
  .action(async (options) => {
    await listTools(options)
  })
