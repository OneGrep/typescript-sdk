import { Buffer } from 'buffer'
import { RemoteClientConfig, RemoteToolCallArgs } from './mcp/types.js'
import { ConnectedClient, ConnectedClientManager } from './mcp/client.js'
import {
  CallToolResult,
  TextContent,
  ImageContent,
  EmbeddedResource,
  Tool
} from '@modelcontextprotocol/sdk/types.js'
import { log } from '@repo/utils'
import {
  ToolResource,
  ToolCallArgs,
  ExtraProperties,
  JsonSchema,
  ToolMetadata,
  ToolCallInput
} from './types.js'
import {
  ToolCallResultContent,
  ObjectResultContent,
  ToolCallOutput,
  TextResultContent,
  BinaryResultContent
} from './types'
import { z } from 'zod'

type McpCallToolResultContent = Array<
  TextContent | ImageContent | EmbeddedResource
>

function _validateOutputSchema(
  contents: TextContent[],
  toolMetadata: ToolMetadata
): ToolCallResultContent {
  // TODO: Validate that the output model is a valid Pydantic model
  const outputModelType = toolMetadata.zodOutputType()
  if (!outputModelType) {
    throw new Error('Output model is required to validate the output schema')
  }

  const resultContents: ObjectResultContent[] = []
  // TODO: how should the JSONSchema indicate expecting a single vs multiple objects?
  for (const content of contents) {
    try {
      const outputModel = outputModelType.parse(content.text)
      const outputModelDict = outputModel.model_dump()
      resultContents.push({ type: 'object', data: outputModelDict }) // Assuming ObjectResultContent has a type property
    } catch (e) {
      throw new Error(`Text content is not valid: ${e}`)
    }
  }
  return resultContents
}

function validateOutputSchema(
  contents: McpCallToolResultContent,
  toolMetadata: ToolMetadata
): ToolCallResultContent {
  if (
    !contents.every((item) => typeof item === 'object' && item.type === 'text')
  ) {
    throw new Error('All content must be of type TextContent.')
  } else {
    return _validateOutputSchema(contents, toolMetadata)
  }
}

function parseMcpContent(
  mcpContent: McpCallToolResultContent
): ToolCallResultContent {
  const resultContent: (TextResultContent | BinaryResultContent)[] = []
  for (const content of mcpContent) {
    if (content.type === 'text') {
      resultContent.push({ type: 'text', text: content.text })
    } else if (content.type === 'image') {
      // Decode the base64-encoded image data
      const decodedData = Buffer.from(content.data, 'base64').toString('binary')
      resultContent.push({
        type: 'binary',
        data: decodedData,
        mime_type: content.mimeType
      })
    } else if (content.type === 'resource') {
      throw new Error('Embedded resources are not implemented yet')
    } else {
      throw new Error(`Unknown content type: ${JSON.stringify(content)}`)
    }
  }
  return resultContent
}

function parseMcpResult(
  result: CallToolResult,
  toolMetadata: ToolMetadata
): ToolCallOutput {
  if (result.isError) {
    throw new Error('ERROR')
  }

  // Attempt to validate the output schema if it is provided
  if (toolMetadata.outputSchema) {
    return { content: validateOutputSchema(result.content, toolMetadata) }
  }

  // If no output schema is provided, return the raw content
  return { content: parseMcpContent(result.content) }
}

export class McpToolMetadata implements ToolMetadata {
  name: string
  description: string
  icon_url?: URL
  inputSchema: JsonSchema
  outputSchema?: JsonSchema
  extraProperties?: ExtraProperties

  constructor(tool: Tool) {
    this.name = tool.name
    this.description = tool.description || 'Tool ' + tool.name
    this.icon_url = undefined
    this.inputSchema = tool.inputSchema
    this.outputSchema = undefined
    this.extraProperties = undefined
  }

  zodInputType(): z.ZodTypeAny | undefined {
    return undefined
  }

  zodOutputType(): z.ZodTypeAny | undefined {
    return undefined
  }
}

export class MCPToolResource implements ToolResource {
  id: string
  metadata: ToolMetadata
  clientConfig: RemoteClientConfig
  connectedClientManager: ConnectedClientManager

  constructor(
    id: string,
    metadata: ToolMetadata,
    clientConfig: RemoteClientConfig,
    connectedClientManager: ConnectedClientManager
  ) {
    this.id = id
    this.metadata = metadata
    this.clientConfig = clientConfig
    this.connectedClientManager = connectedClientManager
  }

  _toolCallArgs(args: Record<string, any>): RemoteToolCallArgs {
    return {
      toolName: this.metadata.name,
      toolArgs: args
    }
  }

  serverName(): string {
    return this.clientConfig.name
  }

  toolName(): string {
    return this.metadata.name
  }

  // async callTool(args: Record<string, any>): Promise<CallToolResult> {
  //   const remoteToolCallArgs = this._toolCallArgs(args)
  //   log.debug(`Making tool call: ${JSON.stringify(remoteToolCallArgs)}`)
  //   const connected_client = await this.connectedClientManager.createClient(this.clientConfig)
  //   return await connected_client.callTool(remoteToolCallArgs)
  // }

  async call_async_mcp(toolInput: ToolCallInput): Promise<CallToolResult> {
    const connected_client = await this.connectedClientManager.createClient(
      this.clientConfig
    )
    const remoteToolCallArgs = this._toolCallArgs(toolInput.args)
    return await connected_client.callTool(remoteToolCallArgs)
  }

  async call_async(toolInput: ToolCallInput): Promise<ToolCallOutput> {
    const result = await this.call_async_mcp(toolInput)
    return parseMcpResult(result, this.metadata)
  }
}

export const toolMetadataFromTool = (
  tool: Tool,
  inputSchema: JsonSchema,
  outputSchema?: JsonSchema
): ToolMetadata => {
  return {
    name: tool.name,
    description: tool.description || tool.name,
    inputSchema: inputSchema,
    outputSchema: outputSchema || undefined
  } as ToolMetadata
}

export const toolResourceFromTool = (
  tool: Tool,
  clientConfig: RemoteClientConfig,
  connectedClientManager: ConnectedClientManager
) => {
  // TODO: Why is this hacky re-parsing of the input schema necessary? Breaks if you try to pass it directly.
  const inputSchemaString = JSON.stringify(tool.inputSchema)
  // log.debug(`inputSchemaString: ${inputSchemaString}`)
  const inputSchema = JSON.parse(inputSchemaString) as JsonSchema
  // log.debug(`inputSchema re parsed: ${JSON.stringify(inputSchema)}`)

  const id = `${clientConfig.name}::${tool.name}`
  const toolMetadata = toolMetadataFromTool(tool, inputSchema)
  return new MCPToolResource(
    id,
    toolMetadata,
    clientConfig,
    connectedClientManager
  )
}
