import { OneGrepApiClient } from "core/api/client.js";
import { ToolCache, ToolId, ToolResource } from "types.js";
import { BlaxelClient } from "./client.js";
import { BlaxelToolResource } from "./resource.js";

export class BlaxelToolCache implements ToolCache {
  private apiClient: OneGrepApiClient
  private blaxelClient: BlaxelClient
  private toolIdToResource: Map<ToolId, ToolResource> = new Map()

  constructor(apiClient: OneGrepApiClient) {
    this.apiClient = apiClient
    this.blaxelClient = new BlaxelClient()
  }

  async refresh(): Promise<boolean> {
    await this.blaxelClient.refresh()

    // Generate a new tool for each of the tools in each of the tool servers in the blaxel client
    // after it refreshes.

    return true
  }

  async refreshIntegration(integrationName: string): Promise<boolean> {
    await this.blaxelClient.refreshIntegration(integrationName)
    return true
  }

  async get(key: ToolId): Promise<BlaxelToolResource | undefined> {
    return undefined
  }

  async list(): Promise<ToolResource[]> {
    return []
  }

  async cleanup(): Promise<void> {
    return
  }
}

