import { OneGrepApiClient } from './core/api/client.js'
// import { ConnectedClientManager } from './mcp/client.js'; // ! Add back when MCP is supported
import {
  McpCallToolResultContent,
  parseMcpContent
} from './providers/mcp/toolcall.js'

import { McpTool as BlaxelMcpServer } from '@blaxel/sdk/tools/mcpTool'

import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

import {
  ScoredResult,
  ToolCache,
  ToolCallInput,
  ToolCallResponse,
  ToolHandle,
  ToolId,
  ToolServerId,
  JsonSchema,
  EquippedTool,
  FilterOptions,
  ToolCallError,
  ToolDetails
} from './types.js'

import {
  ToolProperties,
  ToolServerClient,
  SearchResponseScoredItemTool,
  // MCPToolServerClient, // ! Add back when MCP is supported
  BlaxelToolServerClient,
  ToolResource
} from './core/api/types.js'

import { OneGrepApiHighLevelClient } from './core/api/high.js'
import { Cache, createCache } from 'cache-manager'
import { Keyv } from 'keyv'

import { log } from '@repo/utils'
import { z } from 'zod'
import { jsonSchemaUtils } from './schema.js'
import { BlaxelClientManager } from 'providers/blaxel/clientManager.js'

export class UniversalToolCache implements ToolCache {
  private highLevelClient: OneGrepApiHighLevelClient

  // * Client managers take care of the low-level details of server connections.
  // Lazy loaded in case we don't actually use Blaxel.
  private blaxelClientManager?: BlaxelClientManager
  // private connectedClientManager: ConnectedClientManager; // ! Add back when MCP is supported

  private serverNameCache: Cache
  private serverClientCache: Cache
  private toolDetailsCache: Cache

  constructor(apiClient: OneGrepApiClient) {
    this.highLevelClient = new OneGrepApiHighLevelClient(apiClient)

    // Configure caches with TTL and max size
    this.serverNameCache = createCache({
      cacheId: 'server-name-cache',
      stores: [
        new Keyv({ ttl: 1000 * 60 * 60 * 24 }) // 24 hours
      ]
    })

    this.serverClientCache = createCache({
      cacheId: 'server-client-cache',
      stores: [
        new Keyv({ ttl: 1000 * 60 * 60 * 24 }) // 24 hours
      ]
    })

    this.toolDetailsCache = createCache({
      cacheId: 'tool-details-cache',
      stores: [
        new Keyv({ ttl: 1000 * 30 }) // 30 seconds
      ]
    })
  }

  private async cleanupServerManagers(): Promise<void> {
    if (this.blaxelClientManager) {
      await this.blaxelClientManager.cleanup()
    }

    // Add other manager cleanups here.
  }

  private async getServerClient(
    serverId: ToolServerId
  ): Promise<ToolServerClient> {
    return await this.serverClientCache.wrap(serverId, async () => {
      return await this.highLevelClient.getServerClient(serverId)
    })
  }

  private async getHandle(toolId: ToolId): Promise<ToolHandle> {
    const toolDetails: ToolDetails = await this.getToolDetails(toolId)
    const toolServerClient: ToolServerClient = await this.getServerClient(
      toolDetails.serverId
    )

    if (toolServerClient.client_type === 'mcp') {
      // Implement and optimize
      if (toolServerClient.transport_type !== 'sse') {
        throw new Error(
          'SSE is the only currently supported transport type for MCP tools'
        )
      }

      throw new Error('MCP tools are not yet supported')
    } else if (toolServerClient.client_type === 'blaxel') {
      const blaxelToolServerClient = toolServerClient as BlaxelToolServerClient
      if (!this.blaxelClientManager) {
        this.blaxelClientManager = new BlaxelClientManager()
      }

      const toolServer: BlaxelMcpServer =
        await this.blaxelClientManager.getServer(
          blaxelToolServerClient.blaxel_function
        )

      log.debug(`Found blaxel tool server: ${toolServerClient.blaxel_function}`)

      // TODO: How to determine the output type?
      const parseResultFunc = (
        result: CallToolResult
      ): ToolCallResponse<any> => {
        log.debug('Parsing blaxel tool result')
        const resultContent = result.content as McpCallToolResultContent
        const content = parseMcpContent(resultContent)
        return {
          isError: false,
          content: content,
          mode: 'single',
          toZod: () => {
            return z.object({})
          }
        }
      }

      const call = async (
        toolCallInput: ToolCallInput
      ): Promise<ToolCallResponse<any>> => {
        log.info(
          `Calling blaxel tool with input: ${JSON.stringify(toolCallInput)}`
        )
        try {
          const validator = jsonSchemaUtils.getValidator(
            toolDetails.inputSchema
          )
          const valid = validator(toolCallInput.args)
          if (!valid) {
            throw new Error('Invalid tool input arguments')
          }
          const result = (await toolServer.call(
            toolDetails.name,
            toolCallInput.args
          )) as CallToolResult // ! Why does blaxel not return a CallToolResult?
          return parseResultFunc(result)
        } catch (error) {
          if (error instanceof Error) {
            return {
              isError: true,
              message: error.message
            } as ToolCallError
          } else {
            return {
              isError: true,
              message: 'An unknown error occurred'
            } as ToolCallError
          }
        }
      }

      const callSync = (_: ToolCallInput): ToolCallResponse<any> => {
        throw new Error('Blaxel tools do not support sync calls')

        // ! TODO: Was having issues with the sync call, so we're not using it yet.
        // log.info(`Calling blaxel tool with input: ${JSON.stringify(toolCallInput)}`);
        // const result: CallToolResult = toolServer.call(toolCallInput.name, toolCallInput.args);
        // return parseResultFunc(result);
      }

      return {
        call: (input: ToolCallInput) => call(input),
        callSync: (_: ToolCallInput) => callSync(_)
      }
    } else {
      throw new TypeError(
        `Unknown tool server client type: ${typeof toolServerClient}`
      )
    }
  }

  async listIntegrations(): Promise<string[]> {
    // TODO: Replace with endpoint which lists integration names
    return await this.highLevelClient.getAllServerNames()
  }

  async clearServerClientCache(): Promise<boolean> {
    /**
     * Clear the server client cache.
     * Returns true if successful, false otherwise.
     */
    this.serverClientCache.clear()
    log.info('Cleared server client cache')
    return true
  }

  async clearToolDetailsCache(): Promise<boolean> {
    /**
     * Clear the tool metadata cache.
     * Returns true if successful, false otherwise.
     */
    this.toolDetailsCache.clear()
    log.info('Cleared tool metadata cache')
    return true
  }

  async filterTools(
    filterOptions: FilterOptions
  ): Promise<Map<ToolId, ToolDetails>> {
    const result: Map<ToolId, ToolDetails> = new Map()

    if (filterOptions.integrationNames) {
      for (const integrationName of filterOptions.integrationNames) {
        const toolResources = await this.highLevelClient.getToolResourcesForIntegration(integrationName)
        for (const toolResource of toolResources) {
          const toolDetails = await this.getToolDetails(toolResource.tool.id)
          result.set(toolDetails.id, toolDetails)
        }
      }
    }

    return result
  }

  private async getToolDetails(toolId: ToolId): Promise<ToolDetails> {
    const cachedToolDetails = await this.toolDetailsCache.get(toolId) as ToolDetails | null
    if (cachedToolDetails && cachedToolDetails !== null) {
      return cachedToolDetails
    }

    const resource: ToolResource =
      await this.highLevelClient.getToolResource(toolId)

    const toolDetails: ToolDetails = {
      id: resource.tool.id,
      name: resource.tool.name,
      description: resource.description as string,
      iconUrl: resource.tool.icon_url as URL | undefined,
      serverId: resource.tool.server_id,
      integrationName: resource.integration_name,
      inputSchema: resource.tool.input_schema as JsonSchema,
      properties: resource.properties as ToolProperties,
      policy: resource.policy
    }

    await this.toolDetailsCache.set(toolId, toolDetails)
    return toolDetails
  }

  async get(toolId: ToolId): Promise<EquippedTool> {
    const toolDetails: ToolDetails = await this.getToolDetails(toolId)

    const handle: ToolHandle = await this.getHandle(toolId)
    log.debug(`Fetched tool handle for ${toolId}`)

    const equippedTool: EquippedTool = {
      details: toolDetails,
      handle: handle
    }

    return equippedTool
  }

  async search(query: string): Promise<ScoredResult<EquippedTool>[]> {
    log.info(`Searching for tools with query: ${query}`)
    const response: SearchResponseScoredItemTool =
      await this.highLevelClient.searchTools(query)

    const results: ScoredResult<EquippedTool>[] = []

    for (const result of response.results) {
      const equippedTool = await this.get(result.item.id)
      results.push({
        result: equippedTool,
        score: result.score
      })
    }

    return results
  }

  async refreshServerNameCache(): Promise<boolean> {
    /**
     * Refresh the server ids by fetching server ids from the API.
     * Returns true if successful, false otherwise.
     */
    this.serverNameCache.clear()
    const serverNames = this.highLevelClient.getAllServerNames()

    for (const [serverId, serverName] of Object.entries(serverNames)) {
      this.serverNameCache.set(serverId as ToolServerId, serverName)
    }

    log.info(
      `Refreshed server name cache with ${Object.keys(serverNames).length} server names`
    )
    return true
  }

  async refresh(): Promise<boolean> {
    // /**
    //  * Refresh the toolcache using a pipeline pattern.
    //  *
    //  * The pipeline executes steps in sequence:
    //  * 1. Refresh server names (by server id)
    //  * 2. Clear server clients (by server id)
    //  * 3. Clear tool metadata (by tool id)
    //  * 4. Clear tool properties (by tool id)
    //  *
    //  * If any step fails or raises an exception, the refresh process stops and returns False.
    //  */
    // const pipeline = [
    //   this.refreshServerNameCache.bind(this),
    //   this.clearServerClientCache.bind(this),
    //   this.clearToolMetadataCache.bind(this),
    // ]

    // for (const step of pipeline) {
    //   const stepName = step.name
    //   log.debug(`Starting toolcache refresh step: ${stepName}`)

    //   try {
    //     if (!(await step())) {
    //       log.error(`Failed at step: ${stepName}, aborting toolcache refresh`)
    //       return false
    //     }
    //     log.debug(`Successfully completed step: ${stepName}`)
    //   } catch (e) {
    //     log.error(`Exception in ${stepName}`, e)
    //     return false
    //   }
    // }

    await this.refreshServerNameCache()

    log.info('Toolcache refresh completed successfully')
    return true
  }

  async refreshTool(toolId: ToolId): Promise<EquippedTool> {
    return await this.get(toolId)
  }

  async cleanup(): Promise<void> {
    this.serverNameCache.clear()
    this.serverClientCache.clear()
    this.toolDetailsCache.clear()
    await this.cleanupServerManagers()
  }
}
