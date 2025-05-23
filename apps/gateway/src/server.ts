import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'

import express from 'express'

import { Gateway, createGateway } from './app.js'

import { log } from './log.js'

const PORT = process.env.PORT || 8000
const SSE_CONNECTION_PATH = '/sse'
const SSE_MESSAGES_PATH = '/messages'

async function onSIGINT(gateway: Gateway) {
  log.info(`Received SIGINT, shutting down...`)
  await gateway.close()
  process.exit(0)
}

export async function sseServer() {
  const app = express()

  const gateway = await createGateway()

  let transport: SSEServerTransport

  app.get(SSE_CONNECTION_PATH, async (req, res) => {
    log.info('Received connection')
    transport = new SSEServerTransport(SSE_MESSAGES_PATH, res)
    await gateway.connect(transport)
  })

  app.post(SSE_MESSAGES_PATH, async (req, res) => {
    log.info('Received message')
    await transport.handlePostMessage(req, res)
  })

  app.listen(PORT, () => {
    log.info(`Server is running on port ${PORT}`)
  })

  process.on('SIGINT', async () => {
    await onSIGINT(gateway)
  })
}

export async function stdioServer() {
  const transport = new StdioServerTransport()

  const gateway = await createGateway()

  await gateway.connect(transport)

  process.on('SIGINT', async () => {
    await onSIGINT(gateway)
  })
}
