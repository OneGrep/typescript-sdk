import { clientFromConfig, OneGrepApiClient } from './client.js'
import { ConnectedClientManager } from './mcp/client.js'
import { MCPToolResource, toolResourceFromTool } from './resource.js'
import { log } from '@repo/utils'
import { RemoteClientConfig } from './mcp/types.js'

export interface ToolFilter {
  (resource: MCPToolResource): boolean
}

export const ServerNameFilter = (serverName: string): ToolFilter => {
  return (resource: MCPToolResource): boolean => {
    return resource.serverName() === serverName
  }
}

export const ToolNameFilter = (toolName: string): ToolFilter => {
  return (resource: MCPToolResource): boolean => {
    return resource.toolName() === toolName
  }
}

export const AndFilter = (...filters: ToolFilter[]): ToolFilter => {
  return (resource: MCPToolResource): boolean => {
    return filters.every((filter) => filter(resource))
  }
}

export class Toolbox {
  apiClient: OneGrepApiClient
  connectedClientManager: ConnectedClientManager
  metaClientConfig: RemoteClientConfig
  hostClientConfigs: RemoteClientConfig[]
  toolResources: MCPToolResource[] | undefined

  constructor(
    apiClient: OneGrepApiClient,
    connectedClientManager: ConnectedClientManager,
    metaClientConfig: RemoteClientConfig,
    hostClientConfigs: RemoteClientConfig[]
  ) {
    this.apiClient = apiClient
    this.connectedClientManager = connectedClientManager
    this.metaClientConfig = metaClientConfig
    this.hostClientConfigs = hostClientConfigs
  }

  async getToolResources(): Promise<MCPToolResource[]> {
    if (!this.toolResources) {
      const all_configs = [this.metaClientConfig, ...this.hostClientConfigs]
      this.toolResources = await getToolResources(
        this.connectedClientManager,
        all_configs
      )
    }
    return this.toolResources
  }

  async filterToolResources(
    toolFilter: ToolFilter
  ): Promise<MCPToolResource[]> {
    const toolResources = await this.getToolResources()
    return toolResources.filter(toolFilter)
  }

  async matchUniqueToolResource(
    toolFilter: ToolFilter
  ): Promise<MCPToolResource> {
    const filteredToolResources = await this.filterToolResources(toolFilter)
    if (filteredToolResources.length === 0) {
      throw new Error('No tool resource found')
    }
    if (filteredToolResources.length > 1) {
      throw new Error('Multiple tool resources found')
    }
    return filteredToolResources[0] as MCPToolResource
  }

  async close(): Promise<void> {
    await this.connectedClientManager.close()
  }
}

async function getToolResources(
  connectedClientManager: ConnectedClientManager,
  clientConfigs: RemoteClientConfig[]
): Promise<MCPToolResource[]> {
  const allToolResources: MCPToolResource[] = []

  const toolResourcesMap = new Map<string, MCPToolResource[]>()
  await Promise.all(
    clientConfigs.map(async (clientConfig) => {
      try {
        const connected_client =
          await connectedClientManager.createClient(clientConfig)
        const resources = await connected_client.listTools().then((tools) => {
          return tools.map((tool) =>
            toolResourceFromTool(tool, clientConfig, connectedClientManager)
          )
        })
        toolResourcesMap.set(clientConfig.name, resources)
      } catch (error) {
        log.error(`Error creating client for ${clientConfig.name}: ${error}`)
      }
    })
  )
  toolResourcesMap.forEach((resources, name) => {
    log.debug(`Server: ${name}, Resource Count: ${resources.length}`)
  })

  toolResourcesMap.forEach((resources) => {
    allToolResources.push(...resources)
  })
  log.debug(`All tool resources count: ${allToolResources.length}`)
  return allToolResources
}

export async function createToolbox(apiClient: OneGrepApiClient) {
  // Initialize the connected client manager for all clients
  const connectedClientManager = new ConnectedClientManager()

  const metaClientConfig =
    await apiClient.get_meta_client_api_v1_clients_meta_get()
  // const metaServerClient = await connectedClientManager.createClient(metaClientConfig)
  // if (!metaServerClient) {
  //   throw new Error('Failed to create meta server client')
  // }

  const hostClientConfigs =
    await apiClient.get_hosts_clients_api_v1_clients_hosts_get()
  // const hostServerClientMap = new Map<string, ConnectedClient>()
  // for (const hostClientConfig of hostClientConfigs) {
  //   const connectedClient = await connectedClientManager.createClient(hostClientConfig)
  //   if (connectedClient) {
  //     hostServerClientMap.set(hostClientConfig.name, connectedClient)
  //   }
  // }

  return new Toolbox(
    apiClient,
    connectedClientManager,
    metaClientConfig,
    hostClientConfigs
  )
}

export async function getToolbox(): Promise<Toolbox> {
  return await createToolbox(clientFromConfig())
}
