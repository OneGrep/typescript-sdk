import {
  BasicToolDetails,
  ToolCallResponse,
  ToolCallInput,
  ToolHandle,
  ToolServerConnection,
  ToolCallError
} from '~/types.js'
import { jsonSchemaUtils } from '~/schema.js'
import { parseResultFunc } from '~/providers/mcp/toolcall.js'
import { mcpCallTool } from '~/providers/mcp/toolcall.js'
import { ClientSession } from '~/providers/mcp/session.js'

import { BlaxelToolServerClient } from '~/core/index.js'

import { getTool as getBlaxelServerTools } from '@blaxel/sdk'
import { settings as blaxelSettings } from '@blaxel/sdk'

import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

import { log } from '~/core/log.js'

import os from 'os'
import fs from 'fs'
import { join } from 'path'
import { getDopplerSecretManager } from '~/secrets/doppler.js'

/**
 * A tool from the Blaxel MCP server.
 *
 * ! Blaxel doesn't export the Tool type, so we're using this simplified version.
 */
interface BlaxelTool {
  name: string
  description: string
  call(input: unknown): Promise<unknown>
}

class BlaxelSettingsOverrider {
  private workspace: string | undefined
  private apiKey: string | undefined

  constructor(apiKey: string, workspace: string) {
    this.apiKey = apiKey
    this.workspace = workspace
  }

  private constructConfigYaml(): string {
    return `
    context:
      workspace: ${this.workspace}
    workspaces:
      - name: ${this.workspace}
        credentials:
          apiKey: ${this.apiKey}
    `
  }

  sync() {
    const configYaml = this.constructConfigYaml()

    const homeDir = os.homedir()
    fs.writeFileSync(join(homeDir, '.blaxel/config.yaml'), configYaml)

    console.log('Synced Blaxel settings', configYaml)
  }
}

export async function syncBlaxelSettings(): Promise<void> {
  /** Syncs the config yaml used by the blaxel SDK with the environment variables a secrets
   * manager may have set in case the environment variables don't exist.
   */
  await blaxelSettings.authenticate()
  // We have to see if the blaxelsettings object is a validApiKey credential or a clientcredential.
  // If either is valid, we can skip the sync.
  const blaxelCredentials = JSON.parse(
    JSON.stringify(blaxelSettings.credentials)
  )
  if (blaxelCredentials.apiKey && blaxelCredentials.workspace) {
    console.log('Blaxel settings already loaded from api key. Skipping sync.')
    // It correctly loaded existing settings therefore we don't need to forcibly manipulate the blaxel settings.
    return
  } else if (
    blaxelCredentials.clientCredentials &&
    blaxelCredentials.workspace
  ) {
    console.log(
      'Blaxel settings already loaded from client credentials. Skipping sync.'
    )
    // It correctly loaded existing settings therefore we don't need to forcibly manipulate the blaxel settings.
    return
  }

  console.log('No existing blaxel settings found. Syncing Blaxel settings...')

  const secretManager = await getDopplerSecretManager()
  await secretManager.initialize()
  const bl_workspace = await secretManager.getSecret('BL_WORKSPACE')
  const bl_api_key = await secretManager.getSecret('BL_API_KEY')
  console.log('Blaxel workspace', bl_workspace)
  const obfuscated_api_key = bl_api_key?.replace(/./g, '*')
  console.log('Blaxel api key', obfuscated_api_key)

  const override = new BlaxelSettingsOverrider(bl_api_key!, bl_workspace!)
  override.sync()

  // Force it to reload the settings
  await blaxelSettings.authenticate()
}

/**
 * A connection to a Blaxel tool server.
 *
 * Delegates to the Blaxel MCP client cache for ClientSession management rather than ours.
 *
 * TODO: Consider using our own ClientSessionManager for Blaxel MCP clients if they can give us Transport instances.
 */
export class BlaxelToolServerConnection implements ToolServerConnection {
  private toolServerClient: BlaxelToolServerClient
  private mcpClientSession: ClientSession | undefined
  private toolsByName: Map<string, BlaxelTool>

  constructor(
    toolServerClient: BlaxelToolServerClient,
    mcpClientSession?: ClientSession
  ) {
    this.toolServerClient = toolServerClient
    this.mcpClientSession = mcpClientSession
    this.toolsByName = new Map()
  }

  async initialize(): Promise<void> {
    // ! For now the Blaxel Function name is the same as the integration name.
    await syncBlaxelSettings()
    const tools = await getBlaxelServerTools(
      this.toolServerClient.blaxel_function
    )
    log.info(`Found ${tools.length} tools on blaxel MCP server`)

    this.toolsByName = new Map(tools.map((tool) => [tool.name, tool]))
  }

  private get toolNames(): Set<string> {
    return new Set(this.toolsByName.keys())
  }

  async getHandle(toolDetails: BasicToolDetails): Promise<ToolHandle> {
    if (toolDetails.serverId !== this.toolServerClient.server_id) {
      throw new Error(
        `Tool server ID mismatch: ${toolDetails.serverId} !== ${this.toolServerClient.server_id}`
      )
    }

    if (!this.toolNames.has(toolDetails.name)) {
      throw new Error(`Tool not found: ${toolDetails.name}`)
    }

    const callDirect = async (
      toolCallInput: ToolCallInput
    ): Promise<ToolCallResponse<any>> => {
      return await mcpCallTool(
        this.mcpClientSession!.client,
        toolDetails,
        toolCallInput
      )
    }

    const callSyncDirect = (_: ToolCallInput): ToolCallResponse<any> => {
      throw new Error('Blaxel tools do not support sync calls')
    }

    const call = async (
      toolCallInput: ToolCallInput
    ): Promise<ToolCallResponse<any>> => {
      log.info(
        `Calling blaxel tool with input: ${JSON.stringify(toolCallInput)}`
      )
      try {
        const validator = jsonSchemaUtils.getValidator(toolDetails.inputSchema)
        const valid = validator(toolCallInput.args)
        if (!valid) {
          throw new Error('Invalid tool input arguments')
        }
        const tool = this.toolsByName.get(toolDetails.name)
        if (!tool) {
          throw new Error(`Tool not found: ${toolDetails.name}`)
        }

        const result = (await tool.call(toolCallInput.args)) as CallToolResult // ! Why does blaxel not return a CallToolResult type?
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

    if (this.mcpClientSession) {
      return {
        call: callDirect.bind(this),
        callSync: callSyncDirect.bind(this)
      }
    } else {
      return {
        call: call.bind(this),
        callSync: callSync.bind(this)
      }
    }
  }

  async close(): Promise<void> {
    log.info(
      `Closing connection to Blaxel Server ${this.toolServerClient.server_id}`
    )
    // Only close if we have a direct MCP session
    // When using Blaxel SDK's MCP client it manages its own sessions.
    if (this.mcpClientSession) {
      await this.mcpClientSession.close()
    }
  }
}

export async function createBlaxelConnection(
  client: BlaxelToolServerClient,
  mcpClientSession?: ClientSession
): Promise<ToolServerConnection> {
  // If we've been given a direct session, use it instead of the Blaxel SDK's.
  if (mcpClientSession) {
    return new BlaxelToolServerConnection(client, mcpClientSession)
  }

  // NOTE: Using the Blaxel SDK to retrieve their MCP client
  // will automatically use their auth mechanism pulling from the environment.
  // This is not currently easy to override, so it is important to ensure Blaxel is authenticated
  // and the current workspace matches the tool server's workspace.
  try {
    await syncBlaxelSettings()
    await blaxelSettings.authenticate()
    console.log('Create blaxel connection settings', blaxelSettings)
  } catch (error) {
    log.error(
      `Blaxel authentication failed in connection attempt for tool server ${client.server_id}`,
      error
    )
    throw new Error('Failed to authenticate with Blaxel', { cause: error })
  }
  const workspace = blaxelSettings.workspace
  if (!workspace) {
    log.error(
      `Blaxel workspace not found in connection attempt for tool server ${client.server_id}`
    )
    throw new Error('Blaxel workspace not found')
  }

  if (workspace !== client.blaxel_workspace) {
    log.error(
      `Configured Blaxel workspace does not match requested workspace: ${workspace} !== ${client.blaxel_workspace}`
    )
    throw new Error(
      `Incorrect Blaxel workspace: ${workspace} !== ${client.blaxel_workspace}`
    )
  }
  return new BlaxelToolServerConnection(client)
}
