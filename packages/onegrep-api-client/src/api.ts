import { makeApi, Zodios, type ZodiosOptions } from '@zodios/core'
import { z } from 'zod'

type AccountInformation = {
  account: UserAccount
  organization: Organization
  user_id: string
}
type UserAccount = {
  api_key: string
  belongs_to_organization_id?:
    | ((string | null) | Array<string | null>)
    | undefined
  created_at?: ((string | null) | Array<string | null>) | undefined
  doppler_service_token_id?:
    | ((string | null) | Array<string | null>)
    | undefined
  id: string
  updated_at?: ((string | null) | Array<string | null>) | undefined
}
type Organization = {
  created_at?: ((string | null) | Array<string | null>) | undefined
  created_by_user_id?: ((string | null) | Array<string | null>) | undefined
  id: string
  open_invitation_code?: ((string | null) | Array<string | null>) | undefined
  owner_id?: ((string | null) | Array<string | null>) | undefined
  updated_at?: ((string | null) | Array<string | null>) | undefined
}
type ActionApprovalRequest = {
  created_at?: string | undefined
  id: (number | null) | Array<number | null>
  last_updated_at?: string | undefined
  payload?: (({} | null) | Array<{} | null>) | undefined
  policy_id: string
  state?: ActionApprovalState | undefined
  updated_by_user_id: string
}
type ActionApprovalState =
  /**
   * Enum for policy approval states
   *
   * @enum pending, approved, rejected
   */
  'pending' | 'approved' | 'rejected'
type ApprovalAndPolicy = {
  approval: ActionApprovalRequest
  canonical_resource_name: string
  integration_name: string
  policy: Policy
  tool_name: string
}
type Policy = {
  access_policy: AccessPolicyType
  canonical_resource_name: string
  created_at?: ((string | null) | Array<string | null>) | undefined
  description?: ((string | null) | Array<string | null>) | undefined
  event_name: string
  id?: string | undefined
  organization_id?: ((string | null) | Array<string | null>) | undefined
  updated_at?: ((string | null) | Array<string | null>) | undefined
}
type AccessPolicyType =
  /**
   * Enum for access policy types
   *
   * @enum ALWAYS, NEVER, REQUIRES_PERMISSION
   */
  'ALWAYS' | 'NEVER' | 'REQUIRES_PERMISSION'
type AuthenticationStatus = {
  credentials_provided: boolean
  is_authenticated: boolean
  method?:
    | ((AuthenticationMethod | null) | Array<AuthenticationMethod | null>)
    | undefined
  user_id?: ((string | null) | Array<string | null>) | undefined
}
type AuthenticationMethod =
  /**
   * @enum propelauth, api_key
   */
  'propelauth' | 'api_key'
type Body_upsert_secret_api_v1_secrets__secret_name__put = {
  request: UpsertSecretRequest
}
type UpsertSecretRequest = {
  value: (string | {}) | Array<string | {}>
  /**
   * @enum string, object
   */
  value_type: 'string' | 'object'
}
type HTTPValidationError = Partial<{
  detail: Array<ValidationError>
}>
type ValidationError = {
  loc: Array<(string | number) | Array<string | number>>
  msg: string
  type: string
}
type InitializeResponse = {
  clients: Array<
    MCPToolServerClient | BlaxelToolServerClient | SmitheryToolServerClient
  >
  doppler_config?: ((string | null) | Array<string | null>) | undefined
  doppler_env?: ((string | null) | Array<string | null>) | undefined
  doppler_project?: ((string | null) | Array<string | null>) | undefined
  doppler_service_token?: ((string | null) | Array<string | null>) | undefined
  org_id: string
  providers: Array<ToolServerProvider>
  servers: Array<ToolServer>
  tools: Array<Tool>
  user_id: string
}
type MCPToolServerClient = {
  client_type: string
  server_id: string
  /**
   * @enum sse, websocket
   */
  transport_type: 'sse' | 'websocket'
  /**
   * @minLength 1
   */
  url: string
}
type BlaxelToolServerClient = {
  blaxel_function: string
  blaxel_workspace: string
  client_type: string
  server_id: string
}
type SmitheryToolServerClient = {
  client_type: string
  connections: Array<SmitheryConnectionInfo>
  launch_config?:
    | ((ToolServerLaunchConfig | null) | Array<ToolServerLaunchConfig | null>)
    | undefined
  server_id: string
}
type SmitheryConnectionInfo = {
  config_schema?:
    | /**
     * @default true
     */
    (({} | boolean) | Array<{} | boolean>)
    | undefined
  deployment_url?: /**
   * @minLength 1
   */
  string | undefined
  /**
   * @enum ws, http
   */
  type: 'ws' | 'http'
}
type ToolServerLaunchConfig = {
  secret_name: string
  source: string
}
type ToolServerProvider = {
  id: string
  name: string
}
type ToolServer = {
  id: string
  name: string
  properties?: {} | undefined
  provider_id: string
}
type Tool = {
  description?:
    | /**
     * A description of the tool.
     */
    ((string | null) | Array<string | null>)
    | undefined
  icon_url?:
    | /**
     * A URL to an icon for the tool.
     */
    (| /**
         * @minLength 1
         */
        (string | null)
        | Array<
            /**
             * @minLength 1
             */
            string | null
          >
      )
    | undefined
  id: string
  input_schema?:
    | /**
     * A JSON schema for the tool's input (defaults to 'always valid').
     *
     * @default true
     */
    (({} | boolean) | Array<{} | boolean>)
    | undefined
  /**
   * The name of the tool (should be unique within a server).
   */
  name: string
  server_id: string
}
type IntegrationConfigDetails = {
  configuration_state: IntegrationConfigurationState
  name: string
  template: IntegrationTemplate
}
type IntegrationConfigurationState =
  /**
 * The state of an integration from an account perspective (not runtime).
To determine the runtime state, we will have to check the server configuration for
the integration separately depending on our infrastucture selection.
 *
 * @enum agent_local, cloud_hosted_available, cloud_hosted_configured
 */
  'agent_local' | 'cloud_hosted_available' | 'cloud_hosted_configured'
type IntegrationTemplate = {
  args: MCPIntegrationArgs
  auth_scheme?:
    | ((IntegrationAuthScheme | null) | Array<IntegrationAuthScheme | null>)
    | undefined
  default_policies: IntegrationDefaultPolicies
  name: string
  oauth_authorizer?:
    | (
        | (IntegrationOAuthAuthorizer | null)
        | Array<IntegrationOAuthAuthorizer | null>
      )
    | undefined
  repository: string
  secrets?:
    | (
        | (Array<IntegrationSecret> | null)
        | Array<Array<IntegrationSecret> | null>
      )
    | undefined
  sha: string
  /**
   * The version of the integration template.
   */
  version: string
}
type MCPIntegrationArgs = {
  args?: ((Array<string> | null) | Array<Array<string> | null>) | undefined
  command: string
  type: string
}
type IntegrationAuthScheme =
  /**
   * Authentication schemes supported by server templates.
   *
   * @enum token, oauth_1_0, oauth_2_0
   */
  'token' | 'oauth_1_0' | 'oauth_2_0'
type IntegrationDefaultPolicies = {
  /**
   * Policies for tools in this integration.
   */
  tools: Array<PolicyAccessRule>
}
type PolicyAccessRule = {
  access_policy: AccessPolicyType
  description?: ((string | null) | Array<string | null>) | undefined
  event_name: string
}
type IntegrationOAuthAuthorizer =
  /**
   * @enum google, meta
   */
  'google' | 'meta'
type IntegrationSecret = {
  generation_link?: ((string | null) | Array<string | null>) | undefined
  name: string
  value?: ((string | null) | Array<string | null>) | undefined
}
type NewPolicyRequest = {
  access_policy: AccessPolicyType
  event_name: string
  integration_name: string
}
type PaginatedResponse_AuditLog_ = {
  items: Array<AuditLog>
  pagination: PaginationMetadata
}
type AuditLog = {
  action: string
  details?: {} | undefined
  id?: ((number | null) | Array<number | null>) | undefined
  performed_by?: /**
   * @default "system"
   */
  string | undefined
  policy_id: string
  timestamp?: string | undefined
}
type PaginationMetadata = {
  has_next: boolean
  has_prev: boolean
  page: number
  page_size: number
  pages: number
  total: number
}
type PolicyBase = {
  access_policy: AccessPolicyType
  canonical_resource_name: string
  description?: ((string | null) | Array<string | null>) | undefined
  event_name: string
  organization_id?: ((string | null) | Array<string | null>) | undefined
}
type Recipe = {
  created_at?: ((string | null) | Array<string | null>) | undefined
  /**
   * The goal that this recipe is helping an agent achieve.
   */
  goal: string
  id?: string | undefined
  /**
   * The instructions for this recipe.
   */
  instructions: (string | null) | Array<string | null>
  tools: Array<Tool>
  updated_at?: ((string | null) | Array<string | null>) | undefined
}
type RegisteredToolprint = {
  created_at?: ((string | null) | Array<string | null>) | undefined
  created_by?: string | undefined
  id?: string | undefined
  owner_id?: ((string | null) | Array<string | null>) | undefined
  source?: {} | undefined
  /**
   * The checksum of the source toolprint. This helps us track changes from the original vending server/integration.
   */
  source_checksum: string
  toolprint: Toolprint_Output
  tools: Array<Tool>
  updated_at?: ((string | null) | Array<string | null>) | undefined
  updated_by?: ((string | null) | Array<string | null>) | undefined
}
type Toolprint_Output = {
  /**
   * The goal that this recipe is helping an agent achieve.
   */
  goal: string
  /**
   * The instructions on how this recipe should be used.
   */
  instructions: (string | null) | Array<string | null>
  meta: ToolprintMeta_Output
  /**
   * Definitions for how each tool should be used in this toolprint.
   */
  tools: Array<ToolprintTool>
}
type ToolprintMeta_Output = {
  language?: /**
   * The language of the toolprint.
   *
   * @default "en-US"
   */
  string | undefined
  /**
   * The name of the toolprint.
   */
  name: string
  resource_id?:
    | /**
     * The unique identifier for the toolprint.
     */
    ((string | null) | Array<string | null>)
    | undefined
  version?: /**
   * The version of the toolprint definition.
   *
   * @default "0.0.1"
   */
  string | undefined
}
type ToolprintTool = {
  ref: ToolprintToolReference
  usage_hints?:
    | /**
     * A more in-depth description of this tool and what it should be used for in the context of this recipe.
     */
    ((string | null) | Array<string | null>)
    | undefined
}
type ToolprintToolReference = {
  id?:
    | /**
     * An optional reference id
     */
    ((string | null) | Array<string | null>)
    | undefined
  /**
   * The name of the tool. If the tool exists within this server or integration, this value will be used to link to it.
   */
  name: string
  ref_type?:
    | /**
     * The type of reference to the tool. If the tool exists within this server or integration, this value will be used to link to it.
     *
     * @default "local"
     */
    (| (
            | /**
             * @enum local, id
             */
            ('local' | 'id')
            | null
          )
        | Array<
            | /**
             * @enum local, id
             */
            ('local' | 'id')
            | null
          >
      )
    | undefined
}
type ScoredItem_RegisteredToolprint_ = {
  item: RegisteredToolprint
  /**
   * The score of the item [0, 1].
   *
   * @minimum 0
   * @maximum 1
   */
  score: number
}
type ScoredItem_Tool_ = {
  item: Tool
  /**
   * The score of the item [0, 1].
   *
   * @minimum 0
   * @maximum 1
   */
  score: number
}
type SearchResponse_ScoredItem_RegisteredToolprint__ = {
  pagination: PaginationMetadata
  results: Array<ScoredItem_RegisteredToolprint_>
}
type SearchResponse_ScoredItem_Tool__ = {
  pagination: PaginationMetadata
  results: Array<ScoredItem_Tool_>
}
type Server = {
  apiVersion: string
  kind?: /**
   * @default "Server"
   */
  string | undefined
  metadata: KindMetadata
  spec: ServerSpec
  status?: (({} | null) | Array<{} | null>) | undefined
} & {
  [key: string]: any
}
type KindMetadata = {}
type ServerSpec = {
  displayName?: ((string | null) | Array<string | null>) | undefined
  envFromSources?: ((Array<{}> | null) | Array<Array<{}> | null>) | undefined
  image: string
  ingressConfig?:
    | ((IngressConfig | null) | Array<IngressConfig | null>)
    | undefined
  launcherConfig?:
    | ((LauncherConfig | null) | Array<LauncherConfig | null>)
    | undefined
  orgID: string
  port?: /**
   * @default 8000
   */
  number | undefined
  pullPolicy?: /**
   * @default "IfNotPresent"
   */
  string | undefined
  volumeMounts?: ((Array<{}> | null) | Array<Array<{}> | null>) | undefined
  volumes?: ((Array<{}> | null) | Array<Array<{}> | null>) | undefined
}
type IngressConfig = {
  entryPoints?: Array<string> | undefined
  gatewayScheme?: /**
   * @default "http"
   */
  string | undefined
  orgID: string
  orgRouteStrategy?:
    | /**
     * @default "PathPrefix"
     * @enum PathPrefix, Header
     */
    ('PathPrefix' | 'Header')
    | undefined
  proxyDomain: string
  serverID: string
  serverIsDefault?:
    | /**
     * @default false
     */
    ((boolean | null) | Array<boolean | null>)
    | undefined
  serverRouteStrategy?:
    | /**
     * @default "Header"
     * @enum PathPrefix, Header
     */
    ('PathPrefix' | 'Header')
    | undefined
}
type LauncherConfig = {
  configMapName: string
  mountPath: string
}
type Strategy = {
  /**
   * Instructions to follow the strategy.
   */
  instructions: string
  /**
   * The ID of the recipe that was used to generate the strategy.
   */
  recipe_id: string
  /**
   * List of one or more fully-hydrated tool resources that should be used in the strategy to achieve the goal.
   */
  tools: Array<ToolResource>
}
type ToolResource = {
  canonical_resource: CanonicalResource
  description?: ((string | null) | Array<string | null>) | undefined
  id: string
  integration_name: string
  org_id: string
  policy: PolicyBase
  profile_id: string
  properties: ToolProperties
  provider: ToolServerProvider
  server: ToolServer
  tool: Tool
  tool_name: string
}
type CanonicalResource = {
  event_name: string
  org_id: string
  profile_id: string
  server_name: string
}
type ToolProperties = {
  tags: {}
}
type Toolprint_Input = {
  /**
   * The goal that this recipe is helping an agent achieve.
   */
  goal: string
  /**
   * The instructions on how this recipe should be used.
   */
  instructions: (string | null) | Array<string | null>
  meta: ToolprintMeta_Input
  /**
   * Definitions for how each tool should be used in this toolprint.
   */
  tools: Array<ToolprintTool>
}
type ToolprintMeta_Input = {
  language?: /**
   * The language of the toolprint.
   *
   * @default "en-US"
   */
  string | undefined
  /**
   * The name of the toolprint.
   */
  name: string
  resource_id?:
    | /**
     * The unique identifier for the toolprint.
     */
    ((string | null) | Array<string | null>)
    | undefined
  version?: /**
   * The version of the toolprint definition.
   *
   * @default "0.0.1"
   */
  string | undefined
}
type ToolprintRecommendation = {
  meta: SearchResultMeta
  /**
   * The prompts that should be injected into the message stack to prime the agent's LLM.
   */
  prompts: Array<Prompt>
  toolprint: RegisteredToolprint
}
type SearchResultMeta = {
  /**
   * The score of the search result.
   */
  score: number
}
type Prompt = {
  message: string
  /**
   * @enum system, user
   */
  type: 'system' | 'user'
}
type TraefikIngressRoute = {
  apiVersion: string
  kind?: /**
   * @default "IngressRoute"
   */
  string | undefined
  metadata: KindMetadata
  spec: IngressConfig
  status: {}
} & {
  [key: string]: any
}

const UserAccount: z.ZodType<UserAccount> = z
  .object({
    api_key: z.string(),
    belongs_to_organization_id: z.union([z.string(), z.null()]).optional(),
    created_at: z.union([z.string(), z.null()]).optional(),
    doppler_service_token_id: z.union([z.string(), z.null()]).optional(),
    id: z.string(),
    updated_at: z.union([z.string(), z.null()]).optional()
  })
  .strict()
  .passthrough()
const Organization: z.ZodType<Organization> = z
  .object({
    created_at: z.union([z.string(), z.null()]).optional(),
    created_by_user_id: z.union([z.string(), z.null()]).optional(),
    id: z.string(),
    open_invitation_code: z.union([z.string(), z.null()]).optional(),
    owner_id: z.union([z.string(), z.null()]).optional(),
    updated_at: z.union([z.string(), z.null()]).optional()
  })
  .strict()
  .passthrough()
const AccountInformation: z.ZodType<AccountInformation> = z
  .object({
    account: UserAccount.describe(
      'Model for storing user information including their API key'
    ),
    organization: Organization,
    user_id: z.string()
  })
  .strict()
  .passthrough()
const AuthenticationMethod = z.enum(['propelauth', 'api_key'])
const AuthenticationStatus: z.ZodType<AuthenticationStatus> = z
  .object({
    credentials_provided: z.boolean(),
    is_authenticated: z.boolean(),
    method: z.union([AuthenticationMethod, z.null()]).optional(),
    user_id: z.union([z.string(), z.null()]).optional()
  })
  .strict()
  .passthrough()
const AccountCreateRequest = z
  .object({ email: z.string(), invitation_code: z.string() })
  .strict()
  .passthrough()
const ValidationError: z.ZodType<ValidationError> = z
  .object({
    loc: z.array(z.union([z.string(), z.number()])),
    msg: z.string(),
    type: z.string()
  })
  .strict()
  .passthrough()
const HTTPValidationError: z.ZodType<HTTPValidationError> = z
  .object({ detail: z.array(ValidationError) })
  .partial()
  .strict()
  .passthrough()
const ServiceTokenResponse = z
  .object({
    doppler_config: z.union([z.string(), z.null()]),
    doppler_env: z.union([z.string(), z.null()]),
    doppler_project: z.union([z.string(), z.null()]),
    doppler_service_token: z.union([z.string(), z.null()])
  })
  .partial()
  .strict()
  .passthrough()
const policy_id = z
  .union([z.string(), z.null()])
  .describe('Filter by policy ID')
  .optional()
const action = z
  .union([z.string(), z.null()])
  .describe('Filter by action type')
  .optional()
const start_date = z
  .union([z.string(), z.null()])
  .describe('Filter logs after this date (ISO format)')
  .optional()
const end_date = z
  .union([z.string(), z.null()])
  .describe('Filter logs before this date (ISO format)')
  .optional()
const AuditLog: z.ZodType<AuditLog> = z
  .object({
    action: z.string(),
    details: z.object({}).partial().strict().passthrough().optional(),
    id: z.union([z.number(), z.null()]).optional(),
    performed_by: z.string().optional().default('system'),
    policy_id: z.string().uuid(),
    timestamp: z.string().datetime({ offset: true }).optional()
  })
  .strict()
  .passthrough()
const PaginationMetadata: z.ZodType<PaginationMetadata> = z
  .object({
    has_next: z.boolean(),
    has_prev: z.boolean(),
    page: z.number().int(),
    page_size: z.number().int(),
    pages: z.number().int(),
    total: z.number().int()
  })
  .strict()
  .passthrough()
const PaginatedResponse_AuditLog_: z.ZodType<PaginatedResponse_AuditLog_> = z
  .object({
    items: z.array(AuditLog),
    pagination: PaginationMetadata.describe('Metadata for paginated results')
  })
  .strict()
  .passthrough()
const GetAllFlagsResponse = z
  .object({
    flags: z.record(z.union([z.boolean(), z.string()])),
    user_id: z.string()
  })
  .strict()
  .passthrough()
const IntegrationConfigurationState = z.enum([
  'agent_local',
  'cloud_hosted_available',
  'cloud_hosted_configured'
])
const MCPIntegrationArgs: z.ZodType<MCPIntegrationArgs> = z
  .object({
    args: z.union([z.array(z.string()), z.null()]).optional(),
    command: z.string(),
    type: z.string()
  })
  .strict()
  .passthrough()
const IntegrationAuthScheme = z.enum(['token', 'oauth_1_0', 'oauth_2_0'])
const AccessPolicyType = z.enum(['ALWAYS', 'NEVER', 'REQUIRES_PERMISSION'])
const PolicyAccessRule: z.ZodType<PolicyAccessRule> = z
  .object({
    access_policy: AccessPolicyType.describe('Enum for access policy types'),
    description: z.union([z.string(), z.null()]).optional(),
    event_name: z.string()
  })
  .strict()
  .passthrough()
const IntegrationDefaultPolicies: z.ZodType<IntegrationDefaultPolicies> = z
  .object({
    tools: z
      .array(PolicyAccessRule)
      .describe('Policies for tools in this integration.')
  })
  .strict()
  .passthrough()
const IntegrationOAuthAuthorizer = z.enum(['google', 'meta'])
const IntegrationSecret: z.ZodType<IntegrationSecret> = z
  .object({
    generation_link: z.union([z.string(), z.null()]).optional(),
    name: z.string(),
    value: z.union([z.string(), z.null()]).optional()
  })
  .strict()
  .passthrough()
const IntegrationTemplate: z.ZodType<IntegrationTemplate> = z
  .object({
    args: MCPIntegrationArgs,
    auth_scheme: z.union([IntegrationAuthScheme, z.null()]).optional(),
    default_policies: IntegrationDefaultPolicies.describe(
      'Default policies for an integration.'
    ),
    name: z.string(),
    oauth_authorizer: z
      .union([IntegrationOAuthAuthorizer, z.null()])
      .optional(),
    repository: z.string(),
    secrets: z.union([z.array(IntegrationSecret), z.null()]).optional(),
    sha: z.string(),
    version: z.string().describe('The version of the integration template.')
  })
  .strict()
  .passthrough()
const IntegrationConfigDetails: z.ZodType<IntegrationConfigDetails> = z
  .object({
    configuration_state:
      IntegrationConfigurationState.describe(`The state of an integration from an account perspective (not runtime).
To determine the runtime state, we will have to check the server configuration for
the integration separately depending on our infrastucture selection.`),
    name: z.string(),
    template:
      IntegrationTemplate.describe(`Class representation of the server templates that we support. This matches the structure
of server templates under resources/integrations/templates/*`)
  })
  .strict()
  .passthrough()
const CanonicalResource: z.ZodType<CanonicalResource> = z
  .object({
    event_name: z.string(),
    org_id: z.string(),
    profile_id: z.string(),
    server_name: z.string()
  })
  .strict()
  .passthrough()
const PolicyBase: z.ZodType<PolicyBase> = z
  .object({
    access_policy: AccessPolicyType.describe('Enum for access policy types'),
    canonical_resource_name: z.string(),
    description: z.union([z.string(), z.null()]).optional(),
    event_name: z.string(),
    organization_id: z.union([z.string(), z.null()]).optional()
  })
  .strict()
  .passthrough()
const ToolProperties: z.ZodType<ToolProperties> = z
  .object({ tags: z.object({}).partial().strict().passthrough() })
  .strict()
  .passthrough()
const ToolServerProvider: z.ZodType<ToolServerProvider> = z
  .object({ id: z.string().uuid(), name: z.string() })
  .strict()
  .passthrough()
const ToolServer: z.ZodType<ToolServer> = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    properties: z.object({}).partial().strict().passthrough().optional(),
    provider_id: z.string().uuid()
  })
  .strict()
  .passthrough()
const Tool: z.ZodType<Tool> = z
  .object({
    description: z
      .union([z.string(), z.null()])
      .describe('A description of the tool.')
      .optional(),
    icon_url: z
      .union([z.string(), z.null()])
      .describe('A URL to an icon for the tool.')
      .optional(),
    id: z.string().uuid(),
    input_schema: z
      .union([z.object({}).partial().strict().passthrough(), z.boolean()])
      .describe(
        "A JSON schema for the tool's input (defaults to 'always valid')."
      )
      .optional()
      .default(true),
    name: z
      .string()
      .describe('The name of the tool (should be unique within a server).'),
    server_id: z.string().uuid()
  })
  .strict()
  .passthrough()
const ToolResource: z.ZodType<ToolResource> = z
  .object({
    canonical_resource: CanonicalResource.describe(
      'Represents a canonical resource name in object form.'
    ),
    description: z.union([z.string(), z.null()]).optional(),
    id: z.string(),
    integration_name: z.string(),
    org_id: z.string(),
    policy: PolicyBase.describe('Base model with shared policy fields'),
    profile_id: z.string(),
    properties: ToolProperties.describe('Properties for a tool.'),
    provider: ToolServerProvider,
    server: ToolServer,
    tool: Tool.describe('A tool.'),
    tool_name: z.string()
  })
  .strict()
  .passthrough()
const MultipleToolCustomTagsParamsRequest = z
  .object({
    tags: z.object({}).partial().strict().passthrough(),
    tool_names: z.array(z.string())
  })
  .strict()
  .passthrough()
const ToolCustomTagSelectionParamsRequest = z
  .object({
    description: z.union([z.string(), z.null()]).optional(),
    integration_name: z.string(),
    tags: z.array(z.string()),
    tool_name: z.string()
  })
  .strict()
  .passthrough()
const ToolCustomTagsParamsRequest = z
  .object({
    description: z.union([z.string(), z.null()]).optional(),
    integration_name: z.string(),
    tags: z.object({}).partial().strict().passthrough(),
    tool_name: z.string()
  })
  .strict()
  .passthrough()
const Policy: z.ZodType<Policy> = z
  .object({
    access_policy: AccessPolicyType.describe('Enum for access policy types'),
    canonical_resource_name: z.string(),
    created_at: z.union([z.string(), z.null()]).optional(),
    description: z.union([z.string(), z.null()]).optional(),
    event_name: z.string(),
    id: z.string().uuid().optional(),
    organization_id: z.union([z.string(), z.null()]).optional(),
    updated_at: z.union([z.string(), z.null()]).optional()
  })
  .strict()
  .passthrough()
const NewPolicyRequest: z.ZodType<NewPolicyRequest> = z
  .object({
    access_policy: AccessPolicyType.describe('Enum for access policy types'),
    event_name: z.string(),
    integration_name: z.string()
  })
  .strict()
  .passthrough()
const ActionApprovalState = z.enum(['pending', 'approved', 'rejected'])
const ActionApprovalRequest: z.ZodType<ActionApprovalRequest> = z
  .object({
    created_at: z.string().datetime({ offset: true }).optional(),
    id: z.union([z.number(), z.null()]),
    last_updated_at: z.string().datetime({ offset: true }).optional(),
    payload: z
      .union([z.object({}).partial().strict().passthrough(), z.null()])
      .optional(),
    policy_id: z.string().uuid(),
    state: ActionApprovalState.describe(
      'Enum for policy approval states'
    ).optional(),
    updated_by_user_id: z.string()
  })
  .strict()
  .passthrough()
const ApprovalAndPolicy: z.ZodType<ApprovalAndPolicy> = z
  .object({
    approval:
      ActionApprovalRequest.describe(`Model that holds the state of a request for an action to be taken with respect to a policy.
Ex. if the policy is set to require approval, then we will have a request for approval.`),
    canonical_resource_name: z.string(),
    integration_name: z.string(),
    policy: Policy.describe(
      'Policy model that works with both SQL and in-memory storage'
    ),
    tool_name: z.string()
  })
  .strict()
  .passthrough()
const PolicyCheckResult = z
  .object({ approved: z.boolean() })
  .strict()
  .passthrough()
const MCPToolServerClient: z.ZodType<MCPToolServerClient> = z
  .object({
    client_type: z.string(),
    server_id: z.string().uuid(),
    transport_type: z.enum(['sse', 'websocket']),
    url: z.string().min(1).url()
  })
  .strict()
  .passthrough()
const BlaxelToolServerClient: z.ZodType<BlaxelToolServerClient> = z
  .object({
    blaxel_function: z.string(),
    blaxel_workspace: z.string(),
    client_type: z.string(),
    server_id: z.string().uuid()
  })
  .strict()
  .passthrough()
const SmitheryConnectionInfo: z.ZodType<SmitheryConnectionInfo> = z
  .object({
    config_schema: z
      .union([z.object({}).partial().strict().passthrough(), z.boolean()])
      .optional()
      .default(true),
    deployment_url: z.string().min(1).url().optional(),
    type: z.enum(['ws', 'http'])
  })
  .strict()
  .passthrough()
const ToolServerLaunchConfig: z.ZodType<ToolServerLaunchConfig> = z
  .object({ secret_name: z.string(), source: z.string() })
  .strict()
  .passthrough()
const SmitheryToolServerClient: z.ZodType<SmitheryToolServerClient> = z
  .object({
    client_type: z.string(),
    connections: z.array(SmitheryConnectionInfo),
    launch_config: z.union([ToolServerLaunchConfig, z.null()]).optional(),
    server_id: z.string().uuid()
  })
  .strict()
  .passthrough()
const InitializeResponse: z.ZodType<InitializeResponse> = z
  .object({
    clients: z.array(
      z.union([
        MCPToolServerClient,
        BlaxelToolServerClient,
        SmitheryToolServerClient
      ])
    ),
    doppler_config: z.union([z.string(), z.null()]).optional(),
    doppler_env: z.union([z.string(), z.null()]).optional(),
    doppler_project: z.union([z.string(), z.null()]).optional(),
    doppler_service_token: z.union([z.string(), z.null()]).optional(),
    org_id: z.string(),
    providers: z.array(ToolServerProvider),
    servers: z.array(ToolServer),
    tools: z.array(Tool),
    user_id: z.string()
  })
  .strict()
  .passthrough()
const SearchRequest = z
  .object({
    k: z
      .number()
      .int()
      .describe('The number of results to return from index.')
      .optional()
      .default(10),
    min_score: z
      .number()
      .describe('The minimum score to return from index.')
      .optional()
      .default(0),
    page: z
      .number()
      .int()
      .describe('The page number to return.')
      .optional()
      .default(0),
    page_size: z
      .number()
      .int()
      .describe('The number of results per page.')
      .optional()
      .default(10),
    query: z.string().describe('The query used against the search index.')
  })
  .strict()
  .passthrough()
const ToolprintMeta_Output: z.ZodType<ToolprintMeta_Output> = z
  .object({
    language: z
      .string()
      .describe('The language of the toolprint.')
      .optional()
      .default('en-US'),
    name: z.string().describe('The name of the toolprint.'),
    resource_id: z
      .union([z.string(), z.null()])
      .describe('The unique identifier for the toolprint.')
      .optional(),
    version: z
      .string()
      .describe('The version of the toolprint definition.')
      .optional()
      .default('0.0.1')
  })
  .strict()
  .passthrough()
const ToolprintToolReference: z.ZodType<ToolprintToolReference> = z
  .object({
    id: z
      .union([z.string(), z.null()])
      .describe('An optional reference id')
      .optional(),
    name: z
      .string()
      .describe(
        'The name of the tool. If the tool exists within this server or integration, this value will be used to link to it.'
      ),
    ref_type: z
      .union([z.enum(['local', 'id']), z.null()])
      .describe(
        'The type of reference to the tool. If the tool exists within this server or integration, this value will be used to link to it.'
      )
      .optional()
      .default('local')
  })
  .strict()
  .passthrough()
const ToolprintTool: z.ZodType<ToolprintTool> = z
  .object({
    ref: ToolprintToolReference.describe(`A reference to a tool that is used in a toolprint. This reference can link to a tool directly by a unique identifier or indirectly through
a link to the tool server as well as the name of the tool. The latter reference is experimental and relies on the implementor
to ensure that the reference is correctly followed.`),
    usage_hints: z
      .union([z.string(), z.null()])
      .describe(
        'A more in-depth description of this tool and what it should be used for in the context of this recipe.'
      )
      .optional()
  })
  .strict()
  .passthrough()
const Toolprint_Output: z.ZodType<Toolprint_Output> = z
  .object({
    goal: z
      .string()
      .describe('The goal that this recipe is helping an agent achieve.'),
    instructions: z
      .union([z.string(), z.null()])
      .describe('The instructions on how this recipe should be used.'),
    meta: ToolprintMeta_Output.describe(
      'A set of meta fields that are common to all toolprints.'
    ),
    tools: z
      .array(ToolprintTool)
      .describe(
        'Definitions for how each tool should be used in this toolprint.'
      )
  })
  .strict()
  .passthrough()
const RegisteredToolprint: z.ZodType<RegisteredToolprint> = z
  .object({
    created_at: z.union([z.string(), z.null()]).optional(),
    created_by: z.string().optional(),
    id: z.string().uuid().optional(),
    owner_id: z.union([z.string(), z.null()]).optional(),
    source: z.object({}).partial().strict().passthrough().optional(),
    source_checksum: z
      .string()
      .describe(
        'The checksum of the source toolprint. This helps us track changes from the original vending server/integration.'
      ),
    toolprint:
      Toolprint_Output.describe(`A declarative definition of a toolprint that describes how tools should be used together
to achieve a goal. This is a simplified model that focuses on the conceptual structure and specifically
avoids referential fields to any persisted entities.`),
    tools: z.array(Tool),
    updated_at: z.union([z.string(), z.null()]).optional(),
    updated_by: z.union([z.string(), z.null()]).optional()
  })
  .strict()
  .passthrough()
const ScoredItem_RegisteredToolprint_: z.ZodType<ScoredItem_RegisteredToolprint_> =
  z
    .object({
      item: RegisteredToolprint.describe('A toolprint.'),
      score: z.number().gte(0).lte(1).describe('The score of the item [0, 1].')
    })
    .strict()
    .passthrough()
const SearchResponse_ScoredItem_RegisteredToolprint__: z.ZodType<SearchResponse_ScoredItem_RegisteredToolprint__> =
  z
    .object({
      pagination: PaginationMetadata.describe('Metadata for paginated results'),
      results: z.array(ScoredItem_RegisteredToolprint_)
    })
    .strict()
    .passthrough()
const SearchResultMeta: z.ZodType<SearchResultMeta> = z
  .object({ score: z.number().describe('The score of the search result.') })
  .strict()
  .passthrough()
const Prompt: z.ZodType<Prompt> = z
  .object({ message: z.string(), type: z.enum(['system', 'user']) })
  .strict()
  .passthrough()
const ToolprintRecommendation: z.ZodType<ToolprintRecommendation> = z
  .object({
    meta: SearchResultMeta.describe(
      'Metadata about a search result. All search result types should inherit from this model.'
    ),
    prompts: z
      .array(Prompt)
      .describe(
        "The prompts that should be injected into the message stack to prime the agent's LLM."
      ),
    toolprint: RegisteredToolprint.describe('A toolprint.')
  })
  .strict()
  .passthrough()
const ScoredItem_Tool_: z.ZodType<ScoredItem_Tool_> = z
  .object({
    item: Tool.describe('A tool.'),
    score: z.number().gte(0).lte(1).describe('The score of the item [0, 1].')
  })
  .strict()
  .passthrough()
const SearchResponse_ScoredItem_Tool__: z.ZodType<SearchResponse_ScoredItem_Tool__> =
  z
    .object({
      pagination: PaginationMetadata.describe('Metadata for paginated results'),
      results: z.array(ScoredItem_Tool_)
    })
    .strict()
    .passthrough()
const UpsertSecretRequest: z.ZodType<UpsertSecretRequest> = z
  .object({
    value: z.union([z.string(), z.object({}).partial().strict().passthrough()]),
    value_type: z.enum(['string', 'object'])
  })
  .strict()
  .passthrough()
const Body_upsert_secret_api_v1_secrets__secret_name__put: z.ZodType<Body_upsert_secret_api_v1_secrets__secret_name__put> =
  z.object({ request: UpsertSecretRequest }).strict().passthrough()
const X_ONEGREP_PROFILE_ID = z.union([z.string(), z.null()]).optional()
const UpsertSecretResponse = z
  .object({ secret_name: z.string(), success: z.boolean() })
  .strict()
  .passthrough()
const ToolServerProperties = z
  .object({ properties: z.object({}).partial().strict().passthrough() })
  .strict()
  .passthrough()
const Strategy: z.ZodType<Strategy> = z
  .object({
    instructions: z.string().describe('Instructions to follow the strategy.'),
    recipe_id: z
      .string()
      .uuid()
      .describe('The ID of the recipe that was used to generate the strategy.'),
    tools: z
      .array(ToolResource)
      .describe(
        'List of one or more fully-hydrated tool resources that should be used in the strategy to achieve the goal.'
      )
  })
  .strict()
  .passthrough()
const Recipe: z.ZodType<Recipe> = z
  .object({
    created_at: z.union([z.string(), z.null()]).optional(),
    goal: z
      .string()
      .describe('The goal that this recipe is helping an agent achieve.'),
    id: z.string().uuid().optional(),
    instructions: z
      .union([z.string(), z.null()])
      .describe('The instructions for this recipe.'),
    tools: z.array(Tool),
    updated_at: z.union([z.string(), z.null()]).optional()
  })
  .strict()
  .passthrough()
const ToolprintMeta_Input: z.ZodType<ToolprintMeta_Input> = z
  .object({
    language: z
      .string()
      .describe('The language of the toolprint.')
      .optional()
      .default('en-US'),
    name: z.string().describe('The name of the toolprint.'),
    resource_id: z
      .union([z.string(), z.null()])
      .describe('The unique identifier for the toolprint.')
      .optional(),
    version: z
      .string()
      .describe('The version of the toolprint definition.')
      .optional()
      .default('0.0.1')
  })
  .strict()
  .passthrough()
const Toolprint_Input: z.ZodType<Toolprint_Input> = z
  .object({
    goal: z
      .string()
      .describe('The goal that this recipe is helping an agent achieve.'),
    instructions: z
      .union([z.string(), z.null()])
      .describe('The instructions on how this recipe should be used.'),
    meta: ToolprintMeta_Input.describe(
      'A set of meta fields that are common to all toolprints.'
    ),
    tools: z
      .array(ToolprintTool)
      .describe(
        'Definitions for how each tool should be used in this toolprint.'
      )
  })
  .strict()
  .passthrough()
const BasicPostBody = z.object({ content: z.string() }).strict().passthrough()
const BasicPostResponse = z
  .object({
    message: z.union([z.string(), z.null()]).optional(),
    success: z.boolean()
  })
  .strict()
  .passthrough()
const MultiIdPostBody = z
  .object({ ids: z.union([z.array(z.string()), z.array(z.string().uuid())]) })
  .strict()
  .passthrough()
const CreateInvitationRequest = z
  .object({
    email: z.string().email(),
    expires_in_days: z.number().int().optional().default(7),
    org_id: z.union([z.string(), z.null()]).optional()
  })
  .strict()
  .passthrough()
const CreateUserRequest = z
  .object({ org_id: z.string() })
  .strict()
  .passthrough()
const IngressConfig: z.ZodType<IngressConfig> = z
  .object({
    entryPoints: z.array(z.string()).optional(),
    gatewayScheme: z.string().optional().default('http'),
    orgID: z.string(),
    orgRouteStrategy: z
      .enum(['PathPrefix', 'Header'])
      .optional()
      .default('PathPrefix'),
    proxyDomain: z.string(),
    serverID: z.string(),
    serverIsDefault: z.union([z.boolean(), z.null()]).optional().default(false),
    serverRouteStrategy: z
      .enum(['PathPrefix', 'Header'])
      .optional()
      .default('Header')
  })
  .strict()
  .passthrough()
const Invitation = z
  .object({
    accepted: z.boolean().optional().default(false),
    accepted_at: z.union([z.string(), z.null()]).optional(),
    code: z.string().optional(),
    created_at: z.string().datetime({ offset: true }).optional(),
    email: z.string().email(),
    expires_at: z.string().datetime({ offset: true }).optional(),
    org_id: z.string()
  })
  .strict()
  .passthrough()
const KindMetadata: z.ZodType<KindMetadata> = z
  .object({})
  .partial()
  .strict()
  .passthrough()
const LauncherConfig: z.ZodType<LauncherConfig> = z
  .object({ configMapName: z.string(), mountPath: z.string() })
  .strict()
  .passthrough()
const MCPServerConfig = z
  .object({
    args: z.array(z.string()),
    command: z.string(),
    env_vars: z.record(z.string()),
    git_branch: z.union([z.string(), z.null()]).optional().default('main'),
    git_repo_url: z.union([z.string(), z.null()]).optional(),
    image: z
      .string()
      .optional()
      .default('registry.onegrep.dev/onegrep/mcp-host:latest'),
    name: z.string()
  })
  .strict()
  .passthrough()
const ServerSpec: z.ZodType<ServerSpec> = z
  .object({
    displayName: z.union([z.string(), z.null()]).optional(),
    envFromSources: z
      .union([z.array(z.object({}).partial().strict().passthrough()), z.null()])
      .optional(),
    image: z.string(),
    ingressConfig: z.union([IngressConfig, z.null()]).optional(),
    launcherConfig: z.union([LauncherConfig, z.null()]).optional(),
    orgID: z.string(),
    port: z.number().int().optional().default(8000),
    pullPolicy: z.string().optional().default('IfNotPresent'),
    volumeMounts: z
      .union([z.array(z.object({}).partial().strict().passthrough()), z.null()])
      .optional(),
    volumes: z
      .union([z.array(z.object({}).partial().strict().passthrough()), z.null()])
      .optional()
  })
  .strict()
  .passthrough()
const Server: z.ZodType<Server> = z
  .object({
    apiVersion: z.string(),
    kind: z.string().optional().default('Server'),
    metadata: KindMetadata,
    spec: ServerSpec,
    status: z
      .union([z.object({}).partial().strict().passthrough(), z.null()])
      .optional()
  })
  .strict()
  .passthrough()
const TraefikIngressRoute: z.ZodType<TraefikIngressRoute> = z
  .object({
    apiVersion: z.string(),
    kind: z.string().optional().default('IngressRoute'),
    metadata: KindMetadata,
    spec: IngressConfig,
    status: z.object({}).partial().strict().passthrough()
  })
  .strict()
  .passthrough()

export const schemas = {
  UserAccount,
  Organization,
  AccountInformation,
  AuthenticationMethod,
  AuthenticationStatus,
  AccountCreateRequest,
  ValidationError,
  HTTPValidationError,
  ServiceTokenResponse,
  policy_id,
  action,
  start_date,
  end_date,
  AuditLog,
  PaginationMetadata,
  PaginatedResponse_AuditLog_,
  GetAllFlagsResponse,
  IntegrationConfigurationState,
  MCPIntegrationArgs,
  IntegrationAuthScheme,
  AccessPolicyType,
  PolicyAccessRule,
  IntegrationDefaultPolicies,
  IntegrationOAuthAuthorizer,
  IntegrationSecret,
  IntegrationTemplate,
  IntegrationConfigDetails,
  CanonicalResource,
  PolicyBase,
  ToolProperties,
  ToolServerProvider,
  ToolServer,
  Tool,
  ToolResource,
  MultipleToolCustomTagsParamsRequest,
  ToolCustomTagSelectionParamsRequest,
  ToolCustomTagsParamsRequest,
  Policy,
  NewPolicyRequest,
  ActionApprovalState,
  ActionApprovalRequest,
  ApprovalAndPolicy,
  PolicyCheckResult,
  MCPToolServerClient,
  BlaxelToolServerClient,
  SmitheryConnectionInfo,
  ToolServerLaunchConfig,
  SmitheryToolServerClient,
  InitializeResponse,
  SearchRequest,
  ToolprintMeta_Output,
  ToolprintToolReference,
  ToolprintTool,
  Toolprint_Output,
  RegisteredToolprint,
  ScoredItem_RegisteredToolprint_,
  SearchResponse_ScoredItem_RegisteredToolprint__,
  SearchResultMeta,
  Prompt,
  ToolprintRecommendation,
  ScoredItem_Tool_,
  SearchResponse_ScoredItem_Tool__,
  UpsertSecretRequest,
  Body_upsert_secret_api_v1_secrets__secret_name__put,
  X_ONEGREP_PROFILE_ID,
  UpsertSecretResponse,
  ToolServerProperties,
  Strategy,
  Recipe,
  ToolprintMeta_Input,
  Toolprint_Input,
  BasicPostBody,
  BasicPostResponse,
  MultiIdPostBody,
  CreateInvitationRequest,
  CreateUserRequest,
  IngressConfig,
  Invitation,
  KindMetadata,
  LauncherConfig,
  MCPServerConfig,
  ServerSpec,
  Server,
  TraefikIngressRoute
}

const endpoints = makeApi([
  {
    method: 'delete',
    path: '/api/v1/account/',
    alias: 'delete_account_api_v1_account__delete',
    requestFormat: 'json',
    response: z.boolean()
  },
  {
    method: 'get',
    path: '/api/v1/account/',
    alias: 'get_account_information_api_v1_account__get',
    requestFormat: 'json',
    response: AccountInformation
  },
  {
    method: 'post',
    path: '/api/v1/account/',
    alias: 'create_account_api_v1_account__post',
    description: `Creates a new account given an authenticated user if they recently signed up via PropelAuth.

NOTE: This only creates the account, not assign the user to an organization.
      Use invitation codes to assign to an organization.`,
    requestFormat: 'json',
    response: UserAccount
  },
  {
    method: 'get',
    path: '/api/v1/account/api-key',
    alias: 'get_api_key_api_v1_account_api_key_get',
    description: `Returns the API key information for the authenticated user.`,
    requestFormat: 'json',
    response: UserAccount
  },
  {
    method: 'get',
    path: '/api/v1/account/auth/status',
    alias: 'get_auth_status_api_v1_account_auth_status_get',
    description: `Returns the authentications state of the caller. Will read their API Key or JWT and then determine
if a OneGrep account exists. If yes, then it will be considered authenticated.

# ! NOTE: The User may have a valid JWT but if they do not have a OneGrep account, they will not be considered authenticated.`,
    requestFormat: 'json',
    response: AuthenticationStatus
  },
  {
    method: 'post',
    path: '/api/v1/account/invitation-code',
    alias: 'create_account_by_invitation_api_v1_account_invitation_code_post',
    description: `Creates a new account given an authenticated user and a valid invitation code.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: AccountCreateRequest
      }
    ],
    response: AccountInformation,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/account/service-token',
    alias: 'get_service_token_api_v1_account_service_token_get',
    description: `Returns the service token information for the authenticated user.`,
    requestFormat: 'json',
    response: ServiceTokenResponse
  },
  {
    method: 'post',
    path: '/api/v1/account/service-token',
    alias: 'rotate_service_token_api_v1_account_service_token_post',
    requestFormat: 'json',
    response: ServiceTokenResponse
  },
  {
    method: 'get',
    path: '/api/v1/audit/',
    alias: 'get_audit_logs_api_v1_audit__get',
    description: `Gets audit logs visible to the user with pagination and filtering.

- Page numbers start at 1 (not 0)
- Results are sorted by timestamp (newest first)
- Optional filters can be applied for policy_id, action, and date range`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'page',
        type: 'Query',
        schema: z
          .number()
          .int()
          .gte(1)
          .describe('Page number (1-indexed)')
          .optional()
          .default(1)
      },
      {
        name: 'page_size',
        type: 'Query',
        schema: z
          .number()
          .int()
          .gte(1)
          .lte(500)
          .describe('Items per page')
          .optional()
          .default(100)
      },
      {
        name: 'policy_id',
        type: 'Query',
        schema: policy_id
      },
      {
        name: 'action',
        type: 'Query',
        schema: action
      },
      {
        name: 'start_date',
        type: 'Query',
        schema: start_date
      },
      {
        name: 'end_date',
        type: 'Query',
        schema: end_date
      }
    ],
    response: PaginatedResponse_AuditLog_,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/flags/',
    alias: 'get_all_flags_api_v1_flags__get',
    requestFormat: 'json',
    response: GetAllFlagsResponse
  },
  {
    method: 'get',
    path: '/api/v1/integrations/',
    alias: 'list_integrations_api_v1_integrations__get',
    description: `Lists all available integrations for a user&#x27;s organization.
If active is true, only returns integrations that have an active tool server.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'active',
        type: 'Query',
        schema: z.boolean().optional().default(false)
      }
    ],
    response: z.array(IntegrationConfigDetails),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/integrations/:integration_name/tools',
    alias:
      'get_integration_tools_api_v1_integrations__integration_name__tools_get',
    description: `Returns details for a tool in an integration available to a user.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'integration_name',
        type: 'Path',
        schema: z.string()
      }
    ],
    response: z.array(ToolResource),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/integrations/:integration_name/tools/:tool_name',
    alias:
      'get_tool_details_api_v1_integrations__integration_name__tools__tool_name__get',
    description: `Returns the details for a tool in an integration.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'integration_name',
        type: 'Path',
        schema: z.string()
      },
      {
        name: 'tool_name',
        type: 'Path',
        schema: z.string()
      }
    ],
    response: ToolResource,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'delete',
    path: '/api/v1/integrations/:integration_name/tools/:tool_name/custom/tags',
    alias:
      'delete_tool_custom_tags_api_v1_integrations__integration_name__tools__tool_name__custom_tags_delete',
    description: `Deletes custom tags for a tool in an integration.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: ToolCustomTagSelectionParamsRequest
      },
      {
        name: 'integration_name',
        type: 'Path',
        schema: z.string()
      },
      {
        name: 'tool_name',
        type: 'Path',
        schema: z.string()
      }
    ],
    response: ToolResource,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'post',
    path: '/api/v1/integrations/:integration_name/tools/:tool_name/custom/tags',
    alias:
      'upsert_tool_custom_tags_api_v1_integrations__integration_name__tools__tool_name__custom_tags_post',
    description: `Upserts custom tags for a tool in an integration. Will not delete any existing tags but will update any
overlapping tags that are already set.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: ToolCustomTagsParamsRequest
      },
      {
        name: 'integration_name',
        type: 'Path',
        schema: z.string()
      },
      {
        name: 'tool_name',
        type: 'Path',
        schema: z.string()
      }
    ],
    response: ToolResource,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'post',
    path: '/api/v1/integrations/:integration_name/tools/custom/tags',
    alias:
      'upsert_multiple_tool_custom_tags_api_v1_integrations__integration_name__tools_custom_tags_post',
    description: `Upserts custom tags for multiple tools in an integration.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: MultipleToolCustomTagsParamsRequest
      },
      {
        name: 'integration_name',
        type: 'Path',
        schema: z.string()
      }
    ],
    response: z.array(ToolResource),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/policies/',
    alias: 'get_all_policies_api_v1_policies__get',
    requestFormat: 'json',
    parameters: [
      {
        name: 'skip',
        type: 'Query',
        schema: z.number().int().optional().default(0)
      },
      {
        name: 'limit',
        type: 'Query',
        schema: z.number().int().optional().default(100)
      }
    ],
    response: z.array(Policy),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'post',
    path: '/api/v1/policies/',
    alias: 'create_policy_api_v1_policies__post',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: NewPolicyRequest
      }
    ],
    response: Policy,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/policies/:policy_id',
    alias: 'get_policy_api_v1_policies__policy_id__get',
    requestFormat: 'json',
    parameters: [
      {
        name: 'policy_id',
        type: 'Path',
        schema: z.string()
      }
    ],
    response: Policy,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'put',
    path: '/api/v1/policies/:policy_id',
    alias: 'update_policy_api_v1_policies__policy_id__put',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({}).partial().strict().passthrough()
      },
      {
        name: 'policy_id',
        type: 'Path',
        schema: z.string()
      }
    ],
    response: Policy,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'post',
    path: '/api/v1/policies/:policy_id/:audit_id/status',
    alias:
      'check_policy_status_api_v1_policies__policy_id___audit_id__status_post',
    requestFormat: 'json',
    parameters: [
      {
        name: 'policy_id',
        type: 'Path',
        schema: z.string().uuid()
      },
      {
        name: 'audit_id',
        type: 'Path',
        schema: z.number().int()
      }
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/policies/approvals',
    alias: 'get_approval_requests_api_v1_policies_approvals_get',
    description: `Get all approval requests visible to the user with their associated policies and resource details.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'page',
        type: 'Query',
        schema: z.number().int().optional().default(0)
      },
      {
        name: 'page_size',
        type: 'Query',
        schema: z.number().int().optional().default(100)
      }
    ],
    response: z.array(ApprovalAndPolicy),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/policies/resources/:resource_name/approval',
    alias:
      'check_resource_for_approval_api_v1_policies_resources__resource_name__approval_get',
    description: `Checks the policy that is associated with a resource if it requires approval, if yes, this will create an approval request. If the policy indicates that
it does require approval, this will wait for the user to approve or reject the request before returning back the final
response and HTTP CODE. 200 &#x3D; approved or didn&#x27;t require approval, 403 &#x3D; rejected by the user.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'resource_name',
        type: 'Path',
        schema: z.string()
      }
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/policies/resources/check',
    alias: 'check_resource_access_get_api_v1_policies_resources_check_get',
    requestFormat: 'json',
    response: z.object({ approved: z.boolean() }).strict().passthrough()
  },
  {
    method: 'post',
    path: '/api/v1/policies/resources/check',
    alias: 'check_resource_access_api_v1_policies_resources_check_post',
    description: `Generic endpoint to check resource access.`,
    requestFormat: 'json',
    response: z.object({ approved: z.boolean() }).strict().passthrough()
  },
  {
    method: 'get',
    path: '/api/v1/providers/',
    alias: 'list_providers_api_v1_providers__get',
    requestFormat: 'json',
    response: z.array(ToolServerProvider)
  },
  {
    method: 'get',
    path: '/api/v1/providers/:provider_id',
    alias: 'get_provider_api_v1_providers__provider_id__get',
    requestFormat: 'json',
    parameters: [
      {
        name: 'provider_id',
        type: 'Path',
        schema: z.string()
      }
    ],
    response: ToolServerProvider,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/providers/:provider_id/servers',
    alias: 'get_servers_api_v1_providers__provider_id__servers_get',
    requestFormat: 'json',
    parameters: [
      {
        name: 'provider_id',
        type: 'Path',
        schema: z.string()
      }
    ],
    response: z.array(ToolServer),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'post',
    path: '/api/v1/providers/:provider_id/sync',
    alias: 'sync_provider_api_v1_providers__provider_id__sync_post',
    requestFormat: 'json',
    parameters: [
      {
        name: 'provider_id',
        type: 'Path',
        schema: z.string()
      }
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/sdk/initialize',
    alias: 'initialize_api_v1_sdk_initialize_get',
    requestFormat: 'json',
    response: InitializeResponse
  },
  {
    method: 'get',
    path: '/api/v1/sdk/service-token',
    alias: 'get_service_token_api_v1_sdk_service_token_get',
    description: `Returns the service token information for the authenticated user.`,
    requestFormat: 'json',
    response: ServiceTokenResponse
  },
  {
    method: 'post',
    path: '/api/v1/search/reindex',
    alias: 'reindex_api_v1_search_reindex_post',
    description: `Reindexes all tools and toolprints for an organization.`,
    requestFormat: 'json',
    response: z.unknown()
  },
  {
    method: 'post',
    path: '/api/v1/search/reindex/toolprints',
    alias: 'reindex_toolprints_api_v1_search_reindex_toolprints_post',
    description: `Reindexes all toolprints for an organization.`,
    requestFormat: 'json',
    response: z.unknown()
  },
  {
    method: 'post',
    path: '/api/v1/search/reindex/tools',
    alias: 'reindex_tools_api_v1_search_reindex_tools_post',
    requestFormat: 'json',
    response: z.unknown()
  },
  {
    method: 'post',
    path: '/api/v1/search/toolprints',
    alias: 'search_toolprints_api_v1_search_toolprints_post',
    description: `Searches for the best set of toolprints that semantically match the query and returns them
along with a similarity score for each toolprint.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: SearchRequest
      }
    ],
    response: SearchResponse_ScoredItem_RegisteredToolprint__,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'post',
    path: '/api/v1/search/toolprints/recommendation',
    alias:
      'get_toolprint_recommendation_api_v1_search_toolprints_recommendation_post',
    description: `Returns a single recommendation for a toolprint based on the goal that is trying to be achieved. It also
includes the set of prompts that should be injected into the message stack to prime the agent&#x27;s LLM.

Args:
    request_context: The authenticated request context
    toolprint_index: The toolprint index manager to search with
    search_request: The search request containing the goal query

Returns:
    A ToolprintRecommendation containing the best matching toolprint and associated prompts`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: SearchRequest
      }
    ],
    response: ToolprintRecommendation,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'post',
    path: '/api/v1/search/tools',
    alias: 'search_tools_api_v1_search_tools_post',
    description: `Searches for the best set of tools that semantically match the query and returns them
along with a similarity score for each tool.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: SearchRequest
      }
    ],
    response: SearchResponse_ScoredItem_Tool__,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/secrets/',
    alias: 'get_secrets_api_v1_secrets__get',
    requestFormat: 'json',
    response: z.unknown()
  },
  {
    method: 'get',
    path: '/api/v1/secrets/:secret_name',
    alias: 'get_secret_api_v1_secrets__secret_name__get',
    requestFormat: 'json',
    parameters: [
      {
        name: 'secret_name',
        type: 'Path',
        schema: z.string()
      }
    ],
    response: z.object({}).partial().strict().passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'put',
    path: '/api/v1/secrets/:secret_name',
    alias: 'upsert_secret_api_v1_secrets__secret_name__put',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: Body_upsert_secret_api_v1_secrets__secret_name__put
      },
      {
        name: 'secret_name',
        type: 'Path',
        schema: z.string()
      },
      {
        name: 'X-ONEGREP-PROFILE-ID',
        type: 'Header',
        schema: X_ONEGREP_PROFILE_ID
      }
    ],
    response: UpsertSecretResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/servers/',
    alias: 'list_servers_api_v1_servers__get',
    requestFormat: 'json',
    response: z.array(ToolServer)
  },
  {
    method: 'get',
    path: '/api/v1/servers/:server_id',
    alias: 'get_server_api_v1_servers__server_id__get',
    requestFormat: 'json',
    parameters: [
      {
        name: 'server_id',
        type: 'Path',
        schema: z.string()
      }
    ],
    response: ToolServer,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/servers/:server_id/client',
    alias: 'get_server_client_api_v1_servers__server_id__client_get',
    requestFormat: 'json',
    parameters: [
      {
        name: 'server_id',
        type: 'Path',
        schema: z.string()
      }
    ],
    response: z.union([
      MCPToolServerClient,
      BlaxelToolServerClient,
      SmitheryToolServerClient
    ]),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/servers/:server_id/properties',
    alias: 'get_server_properties_api_v1_servers__server_id__properties_get',
    requestFormat: 'json',
    parameters: [
      {
        name: 'server_id',
        type: 'Path',
        schema: z.string()
      }
    ],
    response: z
      .object({ properties: z.object({}).partial().strict().passthrough() })
      .strict()
      .passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'patch',
    path: '/api/v1/servers/:server_id/properties/:key',
    alias:
      'patch_server_properties_api_v1_servers__server_id__properties__key__patch',
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({}).partial().strict().passthrough()
      },
      {
        name: 'server_id',
        type: 'Path',
        schema: z.string()
      },
      {
        name: 'key',
        type: 'Path',
        schema: z.string()
      }
    ],
    response: z
      .object({ properties: z.object({}).partial().strict().passthrough() })
      .strict()
      .passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'post',
    path: '/api/v1/strategy/',
    alias: 'get_strategy_api_v1_strategy__post',
    description: `Gets a strategy for a given goal.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: SearchRequest
      }
    ],
    response: z.array(Strategy),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'post',
    path: '/api/v1/strategy/fake',
    alias: 'create_fake_recipes_api_v1_strategy_fake_post',
    description: `Creates fake strategies for testing purposes.`,
    requestFormat: 'json',
    response: z.array(Recipe)
  },
  {
    method: 'post',
    path: '/api/v1/toolprints/',
    alias: 'create_toolprint_api_v1_toolprints__post',
    description: `Creates a new toolprint and indexes it for search.

The process:
1. Validates the toolprint definition
2. Creates and persists the toolprint
3. Indexes the toolprint for semantic search`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: Toolprint_Input
      }
    ],
    response: RegisteredToolprint,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/toolprints/:toolprint_id',
    alias: 'get_toolprint_api_v1_toolprints__toolprint_id__get',
    description: `Gets a specific toolprint by its ID.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'toolprint_id',
        type: 'Path',
        schema: z.string().uuid()
      }
    ],
    response: RegisteredToolprint,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/toolprints/.well-known/schema',
    alias: 'get_toolprint_schema_api_v1_toolprints__well_known_schema_get',
    description: `Returns the schema for toolprint definitions.`,
    requestFormat: 'json',
    response: z.object({}).partial().strict().passthrough()
  },
  {
    method: 'get',
    path: '/api/v1/toolprints/.well-known/template',
    alias: 'get_toolprint_template_api_v1_toolprints__well_known_template_get',
    description: `Returns a template for toolprint definitions in YAML format.`,
    requestFormat: 'json',
    response: z.void()
  },
  {
    method: 'post',
    path: '/api/v1/toolprints/json',
    alias: 'create_toolprint_json_api_v1_toolprints_json_post',
    description: `Creates a new toolprint from JSON content and indexes it for search.

The process:
1. Validates the JSON content
2. Creates and persists the toolprint
3. Indexes the toolprint for semantic search`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({ content: z.string() }).strict().passthrough()
      }
    ],
    response: RegisteredToolprint,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'post',
    path: '/api/v1/toolprints/validate',
    alias: 'validate_toolprint_api_v1_toolprints_validate_post',
    description: `Validates a toolprint definition without persisting it.

This endpoint checks:
1. The basic structure and required fields of the toolprint
2. That all referenced tools exist and are accessible to the user
3. That the toolprint definition meets any additional business rules`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: Toolprint_Input
      }
    ],
    response: BasicPostResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'post',
    path: '/api/v1/toolprints/validate/json',
    alias: 'validate_toolprint_json_api_v1_toolprints_validate_json_post',
    description: `Validates a toolprint definition in JSON format without persisting it.

This endpoint accepts JSON content and:
1. Validates the JSON can be converted to a Toolprint model
2. Validates the basic structure and required fields
3. Checks that all referenced tools exist and are accessible
4. Verifies the toolprint definition meets business rules`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.object({ content: z.string() }).strict().passthrough()
      }
    ],
    response: z.unknown(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'post',
    path: '/api/v1/toolprints/validate/yaml',
    alias: 'validate_toolprint_yaml_api_v1_toolprints_validate_yaml_post',
    description: `Validates a toolprint definition in YAML format without persisting it.

This endpoint accepts YAML content and:
1. Parses the YAML into a Toolprint model
2. Validates the basic structure and required fields
3. Checks that all referenced tools exist and are accessible
4. Verifies the toolprint definition meets business rules`,
    requestFormat: 'text',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.string()
      }
    ],
    response: BasicPostResponse,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'post',
    path: '/api/v1/toolprints/yaml',
    alias: 'create_toolprint_yaml_api_v1_toolprints_yaml_post',
    description: `Creates a new toolprint from YAML content and indexes it for search.

The process:
1. Parses and validates the YAML content
2. Creates and persists the toolprint
3. Indexes the toolprint for semantic search`,
    requestFormat: 'text',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: z.string()
      }
    ],
    response: RegisteredToolprint,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/tools/',
    alias: 'list_tools_api_v1_tools__get',
    description: `List all tools for the current user.`,
    requestFormat: 'json',
    response: z.array(Tool)
  },
  {
    method: 'get',
    path: '/api/v1/tools/:tool_id',
    alias: 'get_tool_api_v1_tools__tool_id__get',
    requestFormat: 'json',
    parameters: [
      {
        name: 'tool_id',
        type: 'Path',
        schema: z.string()
      }
    ],
    response: Tool,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/tools/:tool_id/properties',
    alias: 'get_tool_properties_api_v1_tools__tool_id__properties_get',
    requestFormat: 'json',
    parameters: [
      {
        name: 'tool_id',
        type: 'Path',
        schema: z.string()
      }
    ],
    response: z
      .object({ tags: z.object({}).partial().strict().passthrough() })
      .strict()
      .passthrough(),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/api/v1/tools/:tool_id/resource',
    alias: 'get_tool_resource_api_v1_tools__tool_id__resource_get',
    description: `Returns the hydrated details for a tool given the current user and profile.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'tool_id',
        type: 'Path',
        schema: z.string()
      }
    ],
    response: ToolResource,
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'post',
    path: '/api/v1/tools/resources/batch',
    alias: 'get_tool_resources_batch_api_v1_tools_resources_batch_post',
    description: `Returns hydrated tool resources for the specified tool IDs in an efficient batch operation.`,
    requestFormat: 'json',
    parameters: [
      {
        name: 'body',
        type: 'Body',
        schema: MultiIdPostBody
      }
    ],
    response: z.array(ToolResource),
    errors: [
      {
        status: 422,
        description: `Validation Error`,
        schema: HTTPValidationError
      }
    ]
  },
  {
    method: 'get',
    path: '/health',
    alias: 'health_health_get',
    description: `Generic healthcheck endpoint to ensure the service is running.`,
    requestFormat: 'json',
    response: z.unknown()
  }
])

export const api = new Zodios(endpoints)

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
  return new Zodios(baseUrl, endpoints, options)
}
