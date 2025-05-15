import {
  MCPTool,
  MCPClient as MCPClientInterface,
  MCPEndpointConfig
} from '@copilotkit/runtime'

import {
  BasicToolDetails,
  createApiClientFromParams,
  createToolbox,
  Toolbox,
  ToolCallArgs,
  ToolCallInput,
  ToolDetails
} from '@onegrep/sdk'

/**
 * McpClient - A Model Context Protocol client implementation
 *
 * This class implements the Model Context Protocol (MCP) client, which allows for
 * standardized communication with MCP servers. It's designed to be compatible with
 * CopilotKit's runtime by exposing the required interface.
 *
 * The main methods required by CopilotKit are:
 * - tools(): Returns a map of tool names to MCPTool objects
 * - close(): Closes the connection to the MCP server
 */
export class ToolboxClient implements MCPClientInterface {
  private _toolbox: Toolbox

  constructor(toolbox: Toolbox) {
    this._toolbox = toolbox
  }

  get toolbox() {
    return this._toolbox
  }

  /**
   * Normalize tool arguments - detects and fixes common patterns in LLM tool calls
   * like double-nested params objects
   */
  private normalizeToolArgs(
    args: Record<string, unknown>
  ): Record<string, unknown> {
    // Handle double-nested params: { params: { params: { actual data } } }
    if (
      'params' in args &&
      args.params !== null &&
      typeof args.params === 'object'
    ) {
      const paramsObj = args.params as Record<string, unknown>
      if ('params' in paramsObj) {
        console.info('Detected double-nested params, fixing structure')
        return paramsObj
      }
    }

    return args
  }

  /**
   * Process arguments to handle cases where JSON strings might be passed instead of objects
   */
  private processStringifiedJsonArgs(
    args: Record<string, unknown>
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    // Process each argument to handle potential JSON strings
    for (const [key, value] of Object.entries(args)) {
      if (typeof value === 'string') {
        // Try to parse potential JSON strings
        try {
          const parsedValue = JSON.parse(value)
          result[key] = parsedValue
        } catch (e) {
          // Not valid JSON, keep as string
          result[key] = value
        }
      } else if (Array.isArray(value)) {
        // Preserve arrays properly
        result[key] = value.map((item) =>
          typeof item === 'object' && item !== null
            ? this.processStringifiedJsonArgs(item as Record<string, unknown>)
            : item
        )
      } else if (value !== null && typeof value === 'object') {
        // Recursively process nested objects
        result[key] = this.processStringifiedJsonArgs(
          value as Record<string, unknown>
        )
      } else {
        // Keep other types as-is
        result[key] = value
      }
    }

    return result
  }

  private convert(tool: BasicToolDetails): MCPTool {
    const useSchema = tool.inputSchema instanceof Object ? tool.inputSchema : {}
    console.info(`Converting tool: ${tool.name}`)
    return {
      description: tool.description,
      schema: {
        parameters: {
          properties: useSchema.properties,
          required: useSchema.required,
          jsonSchema: useSchema['$schema']
        }
      },
      execute: async (args: Record<string, unknown>) => {
        // ! If we can, try not to even hydrate properties and policies until executing
        const toolDetails: ToolDetails = await this._toolbox.get(tool.id)
        // ! Don't equip until we're executing to be as lazy as possible
        const equippedTool = await toolDetails.equip()
        console.info(`Executing tool: ${tool.name} with args:`, args)

        // ! Taken from mcp-client.ts (is this needed?)
        // Generic handler for double-nested params structure
        // const fixedArgs = this.normalizeToolArgs(args);

        // Process string-encoded JSON objects
        // const processedArgs = this.processStringifiedJsonArgs(fixedArgs);

        const toolCallInput: ToolCallInput = {
          args: args.params as ToolCallArgs,
          approval: undefined
        }
        const result = await equippedTool.handle.call(toolCallInput)
        return result
      }
    }
  }

  async tools(): Promise<Record<string, MCPTool>> {
    const tools = await this._toolbox.listTools()
    const mcpTools: Record<string, MCPTool> = {}

    for (const tool of tools.values()) {
      mcpTools[tool.name] = this.convert(tool)
    }

    return mcpTools
  }

  async close(): Promise<void> {
    return this._toolbox.close()
  }
}

export async function createToolboxClientFromConfig(
  config: MCPEndpointConfig
): Promise<ToolboxClient> {
  // As a small hack for now, we just use the endpoint from the config for our toolbox client
  const endpoint = config.endpoint
  console.info(`Connecting to toolbox at url: ${endpoint}`)

  const apiClient = createApiClientFromParams({
    baseUrl: endpoint,
    apiKey: process.env.ONEGREP_API_KEY // TODO: Make this configurable in the UI?
  })
  return new ToolboxClient(await createToolbox(apiClient))
}

export class ToolboxRegistry {
  private _registry = new Map<string, ToolboxClient>()

  get registry() {
    return this._registry
  }

  async getToolboxClient(config: MCPEndpointConfig): Promise<ToolboxClient> {
    const endpoint = config.endpoint

    if (!this._registry.has(endpoint)) {
      console.info(`Creating new toolbox client for endpoint: ${endpoint}`)
      const toolbox = await createToolboxClientFromConfig(config)
      this._registry.set(endpoint, toolbox)
    }

    return this._registry.get(endpoint)!
  }
}

export const toolboxRegistry = new ToolboxRegistry()

export async function getTools(
  toolboxClient: ToolboxClient
): Promise<Map<string, BasicToolDetails>> {
  try {
    return await toolboxClient.toolbox.listTools()
  } catch (error) {
    console.error('Failed to load tools:', error)
    return new Map()
  }
}
