import { z } from 'zod'

export type ToolId = string

export type JsonSchema = Record<string, any> | boolean

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

  zodInputType: () => z.ZodTypeAny
  zodOutputType: () => z.ZodTypeAny
}

export interface ToolCallApproval {}

export interface ToolCallInput {
  args: ToolCallArgs
  approval: ToolCallApproval | undefined
}

export interface ToolCallError {
  isError: true
  message: string
}

export type ToolCallOutputMode = 'single' | 'multiple'

export interface ToolCallOutput<T> {
  isError: false
  content: ToolCallResultContent
  mode: ToolCallOutputMode
  toZod: () => T
}

export type ToolCallResponse<T> = ToolCallOutput<T> | ToolCallError

export interface ToolResource {
  id: ToolId
  metadata: ToolMetadata

  call_async<T>(input: ToolCallInput): Promise<ToolCallResponse<T>>
}
