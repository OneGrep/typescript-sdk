import { OneGrepApiClient } from '../client.js'
import { ConnectedClientManager } from './client.js'
import { ToolCache, ToolId, ToolResource } from '../types.js'
import { MCPToolResource, toolResourceFromTool } from './resource.js'
import { log } from '@repo/utils'
import { RemoteClientConfig } from './types.js'
import { Tool } from '@modelcontextprotocol/sdk/types.js'
import { getUnixTime } from 'date-fns'

class IntegrationRefreshAttempt {
  constructor(
    public readonly success: boolean,
    public readonly integrationName: string,
    public readonly error?: any,
    public readonly refreshTs: number = getUnixTime(Date.now())
  ) {}
}

export class MCPToolCache implements ToolCache {
  private apiClient: OneGrepApiClient
  private connectedClientManager: ConnectedClientManager
  private allConfigs: Array<RemoteClientConfig> = []
  private toolIdToResource: Map<ToolId, ToolResource> = new Map()
  private toolIdsByIntegration: Map<string, Set<ToolId>> = new Map()

  constructor(
    apiClient: OneGrepApiClient,
    connectedClientManager: ConnectedClientManager
  ) {
    this.apiClient = apiClient
    this.connectedClientManager = connectedClientManager
  }

  private async getToolResourcesForIntegration(
    clientConfig: RemoteClientConfig
  ): Promise<MCPToolResource[]> {
    /** Given an integration, it will return all the ToolResources for that integration. */

    const resourceClient =
      await this.connectedClientManager.getClient(clientConfig)

    if (!resourceClient) {
      log.error(`No connected client found for ${clientConfig.name}`)
      return []
    }

    const tools: Tool[] = await resourceClient.listTools()
    return tools.map((tool) =>
      toolResourceFromTool(tool, clientConfig, this.connectedClientManager)
    )
  }

  private async refreshToolsForIntegration(
    clientConfig: RemoteClientConfig
  ): Promise<IntegrationRefreshAttempt> {
    try {
      /** We want to update our tool cache for the tools we just retrieved via our integration client. */
      const resources: Array<MCPToolResource> =
        await this.getToolResourcesForIntegration(clientConfig)
      const newToolResourceIds = new Set(resources.map((tool) => tool.id))

      // ? Purely for logging purposes. Has no functional impact.
      const previouslyCachedToolIds =
        this.toolIdsByIntegration.get(clientConfig.name) ?? new Set<ToolId>()
      const staleToolIds =
        previouslyCachedToolIds.difference(newToolResourceIds)
      log.debug(`Removing ${staleToolIds.size} tools from ${clientConfig.name}`)

      // Update our tool cache for this integration
      log.debug(
        `Adding ${newToolResourceIds.size} tools to ${clientConfig.name}`
      )
      this.toolIdsByIntegration.set(clientConfig.name, newToolResourceIds)

      // Remove old tools for this integration only. Avoids race conditions when this method is called in parallel for multiple integrations.
      if (previouslyCachedToolIds.size > 0) {
        for (const toolId of previouslyCachedToolIds) {
          this.toolIdToResource.delete(toolId)
        }
      }

      // Add new tools for this integration
      resources.forEach((resource) => {
        this.toolIdToResource.set(resource.id, resource)
      })

      return new IntegrationRefreshAttempt(true, clientConfig.name)
    } catch (e) {
      log.error(
        `Error refreshing tools for integration ${clientConfig.name}`,
        e
      )
      return new IntegrationRefreshAttempt(false, clientConfig.name, e)
    }
  }

  private async refreshAllIntegrations(
    clientConfigs?: Array<RemoteClientConfig>
  ): Promise<Array<IntegrationRefreshAttempt>> {
    const configs = clientConfigs ?? this.allConfigs
    return await Promise.all(
      configs.map((intConfig) => this.refreshToolsForIntegration(intConfig))
    )
  }

  private async refreshClientConfigs(): Promise<void> {
    /** Refreshes the client configs in the toolcache. */
    const metaClientConfig =
      await this.apiClient.get_meta_client_api_v1_clients_meta_get()
    // log.debug(`Meta client config: ${JSON.stringify(metaClientConfig)}`)

    const hostClientConfigs =
      await this.apiClient.get_hosts_clients_api_v1_clients_hosts_get()
    log.debug(
      `Host client configs: ${JSON.stringify(hostClientConfigs, null, 2)}`
    )

    this.allConfigs = [metaClientConfig, ...hostClientConfigs]
    log.info(`${this.allConfigs.length} integrations configs refreshed`)
  }

  async refresh(): Promise<boolean> {
    try {
      await this.refreshClientConfigs()

      // Check if we have any configs to process
      if (this.allConfigs.length === 0) {
        log.warn(
          'No integration configs found. Check your API connection and credentials.'
        )
        return false
      }

      log.debug(`Processing ${this.allConfigs.length} integration configs`)
      const refreshResults = await this.refreshAllIntegrations() //this.allConfigs);
      const successfulResults = refreshResults.filter(
        (result) => result.success
      )
      const failedResults = refreshResults.filter((result) => !result.success)

      // Log a simplified version of the results instead of the full objects
      log.debug(
        `Refresh results:\n\tSuccess: ${successfulResults.length}\n\tFailed: ${failedResults.length}`
      )

      // Log just the names and success status, not the entire objects
      refreshResults.forEach((result) => {
        if (result.success) {
          log.debug(
            `✅ Integration refresh succeeded: ${result.integrationName}`
          )
        } else {
          log.error(`❌ Integration refresh failed: ${result.integrationName}`)
        }
      })

      if (successfulResults.length > 0) {
        log.info(
          `Successfully refreshed ${successfulResults.length} integrations`
        )
        return true
      }

      // If we got here, all integrations failed
      log.error('All integration refreshes failed. Check logs for details.')
      return false
    } catch (error) {
      log.error('Error during refresh', error)
      return false
    }
  }

  // async refreshIntegrations(): Promise<boolean> {
  //   try {
  //     // TODO: Actually healthcheck
  //     // const isOk = this.apiClient.healthcheck()
  //     // if (!isOk) {
  //     //     this.logger.error('API Healthcheck failed: cannot initialize toolcache')
  //     //     return false
  //     // }

  //     log.debug('API Healthcheck passed')

  //     // TODO: Merge meta and host client configs
  //     const metaClientConfig =
  //       await this.apiClient.get_meta_client_api_v1_clients_meta_get()
  //     log.debug(`Meta client config: ${JSON.stringify(metaClientConfig)}`)

  //     const hostClientConfigs =
  //       await this.apiClient.get_hosts_clients_api_v1_clients_hosts_get()
  //     log.debug(`Host client configs: ${JSON.stringify(hostClientConfigs)}`)

  //     this.allConfigs = [metaClientConfig, ...hostClientConfigs]

  //     log.info(
  //       `${this.allConfigs.length} integrations configs refreshed`
  //     )

  //     return true
  //   } catch (e) {
  //     log.error('Error refreshing integrations', e)
  //     return false
  //   }
  // }

  // async refreshTools(): Promise<boolean> {
  //   try {
  //     await this.refreshAllIntegrations()//this.allConfigs)
  //     log.info(`Tools refreshed, currently ${this.toolIdToResource.size} total tools`)
  //     return true
  //   } catch (e) {
  //     log.error('Error refreshing tools', e)
  //     return false
  //   }
  // }

  // // ! OLD pipeline method
  // async refresh() {
  //   const pipeline = [
  //     this.refreshIntegrations.bind(this),
  //     this.refreshTools.bind(this)
  //   ]

  //   for (const step of pipeline) {
  //     const stepName = step.name
  //     log.debug(`Starting toolcache refresh step: ${stepName}`)

  //     try {
  //       if (!(await step())) {
  //         log.error(`Failed at step: ${stepName}, aborting toolcache refresh`)
  //         return false
  //       }
  //       log.debug(`Successfully completed step: ${stepName}`)
  //     } catch (e) {
  //       log.error(`Exception in ${stepName}`, e)
  //       return false
  //     }
  //   }

  //   log.info('Toolcache refresh completed successfully')
  //   return true
  // }

  async get(key: ToolId): Promise<ToolResource | undefined> {
    return this.toolIdToResource.get(key)
  }

  async list(): Promise<ToolResource[]> {
    return Array.from(this.toolIdToResource.values())
  }
}
