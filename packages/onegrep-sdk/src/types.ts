import { Policy, ToolProperties } from 'core/api/types.js'

export type ToolServerProviderId = string
export type ToolServerId = string
export type ToolId = string

export type JsonSchema = Record<string, any> | boolean

/**
 * Schemas that represent how to pass inputs to a tool.
 */
export type ToolCallArgs = Record<string, any>
export interface ToolCallApproval { }
export interface ToolCallInput {
  args: ToolCallArgs
  approval: ToolCallApproval | undefined
}

/**
 * These are the types that describe the shape of a result's content
 */
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

/**
 * These are the types that describe the shape of a tool call's output.
 */
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

/**
 * The core resource object that is used to describe a tool.
 */
export interface ToolDetails {
  id: ToolId
  name: string
  description: string

  // Integration properties
  serverId: string
  integrationName: string

  // Schema properties
  inputSchema: JsonSchema

  // Cosmetic properties
  iconUrl?: URL

  // User-defined properties to describe this tool.
  properties: ToolProperties

  // The tool policy that has been applied to this tool.
  policy: Policy
}

/**
 * A handle to a tool that is used to call the tool.
 */
export interface ToolHandle {
  call: (input: ToolCallInput) => Promise<ToolCallResponse<any>>
  callSync: (input: ToolCallInput) => ToolCallResponse<any>
}

/**
 * A resource object that is used to interact with a tool.
 */
export interface EquippedTool {
  details: ToolDetails
  handle: ToolHandle
}

/**
 * Filtering options that can be passed to the toolbox to filter down to a specific set of tools.
 */
export interface FilterOptions {
  serverIds?: string[]
  integrationNames?: string[]
}

/**
 * A generic representation of a search result with a score for its relevance.
 */
export interface ScoredResult<T> {
  score: number
  result: T
}

export interface ToolCache {
  // Querying methods
  listIntegrations(): Promise<string[]>
  filterTools(toolFilter?: FilterOptions): Promise<Map<ToolId, ToolDetails>>
  get(toolId: ToolId): Promise<EquippedTool>
  search(query: string): Promise<Array<ScoredResult<EquippedTool>>>

  // Housekeeping methods
  refresh(): Promise<boolean>
  refreshTool(toolId: ToolId): Promise<EquippedTool>
  cleanup(): Promise<void>
}

export interface BaseToolbox<T> {
  listIntegrations(): Promise<string[]>
  filterTools(toolFilter?: FilterOptions): Promise<Map<ToolId, ToolDetails>>
  get(toolId: ToolId): Promise<T>
  search(query: string): Promise<Array<ScoredResult<T>>>
  close(): Promise<void>
}
