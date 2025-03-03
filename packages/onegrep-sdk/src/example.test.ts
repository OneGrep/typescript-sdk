import { describe, it, expect, beforeEach } from 'vitest'
import {
  AndFilter,
  ServerNameFilter,
  ToolNameFilter,
  Toolbox,
  createToolbox,
  getToolbox
} from './toolbox.js'
import { MCPToolResource } from './resource.js'
import { log } from '@repo/utils'
import {
  ObjectResultContent,
  ResultContent,
  TextResultContent,
  ToolCallOutput,
  ToolResource
} from './types.js'
import { z } from 'zod'
import { jsonSchemaToZod } from '@onegrep/json-schema-to-zod'
import Ajv from 'ajv'
import { jsonSchemaUtils } from './schema.js'

describe('Example Tests', () => {
  let toolbox: Toolbox

  beforeEach(async () => {
    toolbox = await getToolbox()
  })

  it.skip('should be able to get a zod schema from a tool', async () => {
    const metaServerName = toolbox.metaClientConfig.name
    const toolResources: MCPToolResource[] = await toolbox.getToolResources()
    expect(toolResources.length).toBeGreaterThan(0)
    console.log(
      `Tool names: ${toolResources.map((tool) => tool.metadata.name).join(', ')}`
    )

    const statusNamespaceFilter = AndFilter(
      ServerNameFilter('notion'),
      ToolNameFilter('notion_list_all_users')
    )
    const tool = await toolbox.matchUniqueToolResource(statusNamespaceFilter)
    expect(tool).toBeDefined()
    if (!tool) {
      throw new Error('Tool not found')
    }

    const inputJsonSchema = tool.metadata.inputSchema
    console.log(`Input JSON schema: ${JSON.stringify(inputJsonSchema)}`)
    // const zodInputType = tool.metadata.zodInputType()
    // console.log(`Zod input type: ${JSON.stringify(zodInputType)}`)

    // const zodOutputType = tool.metadata.zodOutputType()
    // console.log(`Zod output type: ${JSON.stringify(zodOutputType)}`)

    await new Promise((resolve) => setTimeout(resolve, 10000))
  })

  it.skip('should be able to make a tool call', async () => {
    const metaServerName = toolbox.metaClientConfig.name
    const toolResources: MCPToolResource[] = await toolbox.getToolResources()
    expect(toolResources.length).toBeGreaterThan(0)
    log.info(
      `Tool names: ${toolResources.map((tool) => tool.metadata.name).join(', ')}`
    )

    const statusNamespaceFilter = AndFilter(
      ServerNameFilter('notion'),
      ToolNameFilter('notion_search')
    )
    const tool = await toolbox.matchUniqueToolResource(statusNamespaceFilter)

    const inputJsonSchema = tool.metadata.inputSchema
    log.info(`Input JSON schema: ${JSON.stringify(inputJsonSchema)}`)

    const args = {
      query: 'send investor email'
    }
    const response: ToolCallOutput<any> = await tool.call_async({
      args: args,
      approval: undefined
    })
    console.info(`Tool output: ${JSON.stringify(response)}`)
    expect(response).toBeDefined()
    expect(response).toBeTypeOf('object')

    const zodOutput = response.toZod()
    console.info(`Tool output: ${JSON.stringify(zodOutput)}`)

    await new Promise((resolve) => setTimeout(resolve, 1000))
  })
})
