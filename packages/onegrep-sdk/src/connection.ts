import {
  BlaxelToolServerClient,
  SmitheryToolServerClient,
  ToolServerClient
} from '~/core/index.js'
import { createBlaxelConnection } from '~/providers/blaxel/connection.js'
import { createSmitheryConnection } from '~/providers/smithery/connection.js'
import {
  ConnectionManager,
  ToolServerConnection,
  ToolServerId
} from '~/types.js'
import {
  MultiTransportClientSession,
  RefreshableMultiTransportClientSession
} from '~/providers/mcp/session.js'
import { ClientSessionFactory } from '~/providers/mcp/session.js'
import { ClientSession } from '~/providers/mcp/session.js'
import { ClientSessionManager } from '~/providers/mcp/session.js'

import { createBlaxelMcpClientTransports as blaxelMcpTransportOptions } from '~/providers/blaxel/transport.js'
import { createSmitheryTransports as smitheryMcpTransportOptions } from '~/providers/smithery/transport.js'

import { log } from '~/core/log.js'

/**
 * Creates a client session for a tool server based on the client type.
 */
export const defaultToolServerSessionFactory: ClientSessionFactory<
  ToolServerClient,
  ClientSession
> = {
  create: async (client: ToolServerClient) => {
    if (client.client_type === 'blaxel') {
      const blaxelClient = client as BlaxelToolServerClient
      return new RefreshableMultiTransportClientSession(
        blaxelMcpTransportOptions(blaxelClient.blaxel_function)
      )
    }
    if (client.client_type === 'smithery') {
      const smitheryClient = client as SmitheryToolServerClient
      return new MultiTransportClientSession(
        smitheryMcpTransportOptions(smitheryClient)
      )
    }
    throw new Error(
      `Unsupported tool server client type: ${client.client_type}`
    )
  }
}

/**
 * Manages tool server sessions for different tool servers.
 *
 * Sessions are cached by tool server id
 *
 * Must use close() to clean up sessions
 */
export function createToolServerSessionManager(
  factory: ClientSessionFactory<
    ToolServerClient,
    ClientSession
  > = defaultToolServerSessionFactory
): ClientSessionManager<ToolServerClient, ClientSession> {
  return new ClientSessionManager<ToolServerClient, ClientSession>(
    factory,
    (client) => Promise.resolve(client.server_id)
  )
}

/**
 * Manages connections to tool servers of different types.
 *
 * connections are cached and reused for efficiency
 *
 * Must use close() to clean up connections
 */
export class ToolServerConnectionManager implements ConnectionManager {
  private toolServerSessionManager: ClientSessionManager<
    ToolServerClient,
    ClientSession
  >
  private openConnections: Map<ToolServerId, ToolServerConnection>

  constructor(
    toolServerSessionManager: ClientSessionManager<
      ToolServerClient,
      ClientSession
    > = createToolServerSessionManager()
  ) {
    this.toolServerSessionManager = toolServerSessionManager
    this.openConnections = new Map()
  }

  private async removeClosedConnection(
    client: ToolServerClient
  ): Promise<void> {
    this.openConnections.delete(client.server_id)
    log.debug(`Removed closed connection for tool server ${client.server_id}`)
  }

  private async newConnection(
    client: ToolServerClient
  ): Promise<ToolServerConnection> {
    // ! Extend the onClose callback to remove the closed connection from the open connections map
    async function extendOnClose(
      manager: ToolServerConnectionManager,
      mcpClientSession: ClientSession
    ) {
      const originalOnClose = mcpClientSession.onClose
      mcpClientSession.onClose = async () => {
        await originalOnClose?.()
        await manager.removeClosedConnection(client)
      }
    }

    if (client.client_type === 'blaxel') {
      if (process.env.ONEGREP_SDK_BLAXEL_USE_SDK_SESSIONS) {
        return await createBlaxelConnection(client as BlaxelToolServerClient)
      }
      const mcpClientSession =
        await this.toolServerSessionManager.getSession(client)
      extendOnClose(this, mcpClientSession)

      return await createBlaxelConnection(
        client as BlaxelToolServerClient,
        mcpClientSession
      )
    }
    if (client.client_type === 'smithery') {
      const mcpClientSession =
        await this.toolServerSessionManager.getSession(client)
      extendOnClose(this, mcpClientSession)

      return await createSmitheryConnection(
        client as SmitheryToolServerClient,
        mcpClientSession
      )
    }

    throw new Error(
      `Unsupported tool server client type: ${client.client_type}`
    )
  }

  /**
   * Connect to a tool server and return a connection.
   *
   * returns an active connection for a given server id if one exists
   * otherwise creates a new connection and caches it
   */
  async connect(client: ToolServerClient): Promise<ToolServerConnection> {
    if (this.openConnections.has(client.server_id)) {
      log.info(`Returning open connection for tool server: ${client.server_id}`)
      return this.openConnections.get(client.server_id)!
    }
    const connection = await this.newConnection(client)
    this.openConnections.set(client.server_id, connection)
    log.info(
      `Opening ${connection.constructor.name} for tool server: ${client.server_id}`
    )

    await connection.initialize()
    log.info(`Connection initialized for tool server: ${client.server_id}`)

    return connection
  }

  /**
   * Close all connections.
   */
  async close(): Promise<void> {
    for (const connection of this.openConnections.values()) {
      await connection.close()
    }
    this.openConnections.clear()
  }
}
