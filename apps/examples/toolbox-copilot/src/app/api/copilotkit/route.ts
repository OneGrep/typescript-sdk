import {
  CopilotRuntime,
  OpenAIAdapter,
  copilotRuntimeNextJSAppRouterEndpoint
} from '@copilotkit/runtime'

import { NextRequest } from 'next/server'
import { toolboxRegistry } from '~/app/utils/toolbox-client'

const serviceAdapter = new OpenAIAdapter()

const runtime = new CopilotRuntime({
  createMCPClient: async (config) => {
    return toolboxRegistry.getToolboxClient(config)
  }
})

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: '/api/copilotkit'
  })

  return handleRequest(req)
}
