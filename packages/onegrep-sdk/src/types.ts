import { z } from 'zod'

export type ToolId = string

export type JsonSchema = Record<string, any>

export type ExtraProperties = Record<string, any>

export type ToolCallArgs = Record<string, any>

export interface ResultContent {
  type: 'text' | 'object' | 'binary'
}

export interface TextResultContent extends ResultContent {
  type: 'text'
  text: string
}

export interface ObjectResultContent extends ResultContent {
  type: 'object'
  data: Record<string, any>
}

export interface BinaryResultContent extends ResultContent {
  type: 'binary'
  data: string
  mime_type: string
}

export type ToolCallResultContent = Array<ResultContent>

export interface ToolMetadata {
  name: string
  description: string
  icon_url?: URL
  inputSchema: JsonSchema
  outputSchema?: JsonSchema
  extraProperties?: ExtraProperties

  zodInputType(): z.ZodTypeAny | undefined
  zodOutputType(): z.ZodTypeAny | undefined
}

export interface ToolCallApproval {}

export interface ToolCallInput {
  args: ToolCallArgs
  approval: ToolCallApproval | undefined
}

export interface ToolCallOutput {
  content: ToolCallResultContent
}

export interface ToolResource {
  id: ToolId
  metadata: ToolMetadata

  call_async(input: ToolCallInput): Promise<ToolCallOutput>
}
