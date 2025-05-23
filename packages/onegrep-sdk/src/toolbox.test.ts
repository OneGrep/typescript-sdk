import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { Toolbox, getToolbox } from './toolbox.js'

import {
  ToolCallError,
  ToolCallResponse,
  EquippedTool,
  ToolCallOutput,
  ToolDetails,
  FilterOptions
} from './types.js'

import 'dotenv/config'

import { fail } from 'assert'

import { testLog } from '../test/log.test.js'

const log = testLog

describe('Base Toolbox Tests', () => {
  let toolbox: Toolbox

  // ! Tool is available for Blaxel deployment
  const integrationName = 'blaxel-search'
  const toolName = 'web_search'

  beforeAll(async () => {
    log.info('Getting toolbox')
    toolbox = await getToolbox()
    log.info('Toolbox fetched')
  })

  afterAll(async () => {
    if (toolbox) {
      await toolbox.close()
      log.info('Toolbox closed')
    }
  })

  it('should get all tool resources', async () => {
    const toolDetailsMap = await toolbox.listTools()
    expect(toolDetailsMap.size).toBeGreaterThan(0)
    log.info(`fetched tool metadata: ${JSON.stringify(toolDetailsMap)}`)
  })

  // it('should be able to get a zod schema from a tool', async () => {
  //   const toolDetailsMap = await toolbox.listTools()
  //   console.debug('toolDetailsMap', toolDetailsMap)
  //   expect(toolDetailsMap.size).toBeGreaterThan(0)

  //   const toolDetails = Array.from(toolDetailsMap.values()).find(
  //     (details) => details.name === toolName
  //   )
  //   expect(toolDetails).toBeDefined()
  //   if (!toolDetails) {
  //     throw new Error(`Tool with name ${toolName} not found`)
  //   }
  //   const tool: EquippedTool = await toolbox.get(toolDetails.id)
  //   expect(tool).toBeDefined()
  //   if (!tool) {
  //     throw new Error('Tool not found')
  //   }
  //   const zodInputType = jsonSchemaUtils.toZodType(tool.details.inputSchema)
  //   log.info(`Zod input type: ${JSON.stringify(zodInputType)}`)
  //   if (!zodInputType) {
  //     throw new Error('Zod input type not found')
  //   }

  //   const testInput = {
  //     query: 'test'
  //   }
  //   const result = zodInputType.safeParse(testInput)
  //   log.info(`Result: ${JSON.stringify(result)}`)
  //   if (!result.success) {
  //     throw new Error('Failed to parse input')
  //   }

  //   const invalidInput = {
  //     text: false
  //   }
  //   const invalidResult = zodInputType.safeParse(invalidInput)
  //   log.info(`Invalid result: ${JSON.stringify(invalidResult)}`)
  //   if (invalidResult.success) {
  //     throw new Error('Invalid result should not be successful')
  //   }
  // })

  it('should be able to make a tool call with invalid input', async () => {
    const filterOptions: FilterOptions = {
      integrationNames: [integrationName]
    }
    const toolMap = await toolbox.filterTools(filterOptions)
    expect(toolMap.size).toBeGreaterThan(0)

    const toolDetails = Array.from(toolMap.values()).find(
      (tool) => tool.name === toolName
    )

    if (!toolDetails) {
      throw new Error(`${toolName} tool not found`)
    }

    const tool: EquippedTool = await toolDetails.equip()
    expect(tool).toBeDefined()
    if (!tool) {
      throw new Error('Equipped tool not found')
    }

    const args = {
      invalid_key: 'baz'
    }

    const response: ToolCallResponse<any> = await tool.handle.call({
      args: args,
      approval: undefined
    })
    expect(response).toBeDefined()
    expect(response).toBeTypeOf('object')
    expect(response.isError).toBe(true)

    const error = response as ToolCallError
    log.info(`Error: ${JSON.stringify(error.message)}`)
    expect(error.message).toBe('Invalid tool input arguments')

    await new Promise((resolve) => setTimeout(resolve, 1000))
  })

  it('should be able to make a tool call with valid input', async () => {
    const filterOptions: FilterOptions = {
      integrationNames: [integrationName]
    }
    const toolMap = await toolbox.filterTools(filterOptions)
    expect(toolMap.size).toBeGreaterThan(0)

    const toolDetails = Array.from(toolMap.values()).find(
      (tool) => tool.name === toolName
    )

    if (!toolDetails) {
      throw new Error(`${toolName} tool not found`)
    }

    const tool: EquippedTool = await toolDetails.equip()
    expect(tool).toBeDefined()
    if (!tool) {
      throw new Error('Equipped tool not found')
    }

    const args = {
      query: 'what is the capital of the moon?'
    }

    const response: ToolCallResponse<any> = await tool.handle.call({
      args: args,
      approval: undefined
    })
    expect(response).toBeDefined()
    expect(response).toBeTypeOf('object')
    expect(response.isError).toBe(false)

    const output = response as ToolCallOutput<any>
    log.info(`Output: ${JSON.stringify(output)}`)

    await new Promise((resolve) => setTimeout(resolve, 1000))
  })
})

describe('Blaxel Toolbox Tests', () => {
  let toolbox: Toolbox

  // ! Tool is available for Blaxel deployment
  // const integrationName = "blaxel-search"
  const integrationName = 'exa'
  const toolName = 'web_search'

  beforeAll(async () => {
    log.info('Getting toolbox')
    toolbox = await getToolbox()
    log.info('Toolbox fetched')
  })

  afterAll(async () => {
    if (toolbox) {
      await toolbox.close()
      log.info('Toolbox closed')
    }
  })

  it('should be able to make a tool call with invalid input', async () => {
    const toolDetailsMap = await toolbox.listTools()
    console.log(
      Array.from(toolDetailsMap.values()).filter(
        (d) =>
          d.integrationName === integrationName ||
          d.integrationName === 'blaxel-search'
      )
    )
    expect(toolDetailsMap.size).toBeGreaterThan(0)
    const basicToolDetails = Array.from(toolDetailsMap.values()).find(
      (details) =>
        details.integrationName === integrationName && details.name === toolName
    )
    expect(basicToolDetails).toBeDefined()
    if (!basicToolDetails) {
      throw new Error(`Tool with name ${toolName} not found`)
    }
    const toolDetails: ToolDetails = await toolbox.get(basicToolDetails.id)
    expect(toolDetails).toBeDefined()
    if (!toolDetails) {
      throw new Error('Tool not found')
    }
    const tool: EquippedTool = await toolDetails.equip()
    expect(tool).toBeDefined()
    if (!tool) {
      throw new Error('Tool not found')
    }

    const args = {
      invalid_key: 'baz'
    }

    const response: ToolCallResponse<any> = await tool.handle.call({
      args: args,
      approval: undefined
    })
    expect(response).toBeDefined()
    expect(response).toBeTypeOf('object')
    expect(response.isError).toBe(true)

    const error = response as ToolCallError
    log.info(`Error: ${JSON.stringify(error.message)}`)
    expect(error.message).toBe('Invalid tool input arguments')

    await new Promise((resolve) => setTimeout(resolve, 1000))
  })

  it('should be able to make a tool call with valid input', async () => {
    const toolDetailsMap = await toolbox.listTools()
    expect(toolDetailsMap.size).toBeGreaterThan(0)
    const basicToolDetails = Array.from(toolDetailsMap.values()).find(
      (details) =>
        details.integrationName === integrationName && details.name === toolName
    )
    expect(basicToolDetails).toBeDefined()
    if (!basicToolDetails) {
      throw new Error(`Tool with name ${toolName} not found`)
    }
    const toolDetails: ToolDetails = await toolbox.get(basicToolDetails.id)
    expect(toolDetails).toBeDefined()
    if (!toolDetails) {
      throw new Error('Tool not found')
    }
    log.info(`toolDetails: ${JSON.stringify(toolDetails)}`)
    const tool: EquippedTool = await toolDetails.equip()
    expect(tool).toBeDefined()
    if (!tool) {
      throw new Error('Tool not found')
    }

    const args = {
      query: 'what is the capital of the moon?'
    }

    const response: ToolCallResponse<any> = await tool.handle.call({
      args: args,
      approval: undefined
    })
    expect(response).toBeDefined()
    expect(response).toBeTypeOf('object')
    if (response.isError) {
      fail(`Tool call failed with error: ${JSON.stringify(response.message)}`)
    }

    const output = response as ToolCallOutput<any>
    log.info(`Output: ${JSON.stringify(output)}`)

    await new Promise((resolve) => setTimeout(resolve, 1000))
  })

  it('should be able to recommend tools', async () => {
    const recommendation = await toolbox.recommend(
      'What is the capital of the moon?'
    )
    expect(recommendation).toBeDefined()
    if (!recommendation) {
      throw new Error('Recommendation not found')
    }

    expect(recommendation.tools.length).toBeGreaterThan(0)
    log.info(`Recommendation: ${JSON.stringify(recommendation)}`)
  })
})

describe('Smithery Toolbox Tests', () => {
  let toolbox: Toolbox

  beforeAll(async () => {
    log.info('Getting toolbox')
    toolbox = await getToolbox()
    log.info('Toolbox fetched')
  })

  afterAll(async () => {
    if (toolbox) {
      await toolbox.close()
      log.info('Toolbox closed')
    }
  })

  it('should be able to make a tool call with valid input', async () => {
    const toolDetails = await toolbox.get(
      '55e6659a-1c58-525f-8d0c-2f6899883fad'
    ) // ! @PhillipRt/think-mcp-server
    expect(toolDetails).toBeDefined()
    log.info(`found tool: ${toolDetails.name}`)

    const tool: EquippedTool = await toolDetails.equip()
    expect(tool).toBeDefined()
    if (!tool) {
      throw new Error('Tool not found')
    }
    log.info(`equipped tool: ${tool.details.name}`)

    const args = {
      thought: 'Is the moon made of cheese?'
    }

    const response: ToolCallResponse<any> = await tool.handle.call({
      args: args,
      approval: undefined
    })
    expect(response).toBeDefined()
    expect(response).toBeTypeOf('object')
    expect(response.isError).toBe(false)

    const output = response as ToolCallOutput<any>
    log.info(`Output: ${JSON.stringify(output)}`)

    await new Promise((resolve) => setTimeout(resolve, 1000))
  })

  it('should be able to make a tool call with valid input and server config', async () => {
    const toolDetails = await toolbox.get(
      'a029eb98-b9f6-54e5-95c9-c4586fad0e4d'
    ) // ! @flrngel/mcp-painter
    expect(toolDetails).toBeDefined()
    log.info(`found tool: ${toolDetails.name}`)

    const tool: EquippedTool = await toolDetails.equip()
    expect(tool).toBeDefined()
    if (!tool) {
      throw new Error('Tool not found')
    }
    log.info(`equipped tool: ${tool.details.name}`)

    const args = {
      width: 100,
      height: 100
    }

    const response: ToolCallResponse<any> = await tool.handle.call({
      args: args,
      approval: undefined
    })
    expect(response).toBeDefined()
    expect(response).toBeTypeOf('object')
    expect(response.isError).toBe(false)

    const output = response as ToolCallOutput<any>
    log.info(`Output: ${JSON.stringify(output)}`)

    await new Promise((resolve) => setTimeout(resolve, 1000))
  })
})

describe('Search Toolbox Tests', () => {
  let toolbox: Toolbox

  beforeAll(async () => {
    log.info('Getting toolbox')
    toolbox = await getToolbox()
    log.info('Toolbox fetched')
  })

  it('should be able to search for tools', async () => {
    const searchResults = await toolbox.search('search')
    expect(searchResults).toBeDefined()
    expect(searchResults.length).toBeGreaterThan(0)
    log.info(`Search results: ${JSON.stringify(searchResults)}`)
  })
})
