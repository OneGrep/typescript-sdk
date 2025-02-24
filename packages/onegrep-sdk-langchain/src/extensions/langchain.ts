import {
  DynamicStructuredTool,
  DynamicStructuredToolInput,
  StructuredTool
} from '@langchain/core/tools'
import { Toolbox } from 'onegrep-sdk'
import { MCPToolResource } from 'onegrep-sdk'
import { z } from 'zod'

async function _call(resource: MCPToolResource, input: any): Promise<any> {
  const result = await resource.call_async({ args: input, approval: undefined })
  // TODO: Check for ObjectResultContent if validated output schema?
  return JSON.stringify(result.content)
}

const convertToStructuredTool = (
  resource: MCPToolResource,
  enforceInputSchema: boolean = true
): StructuredTool => {
  // TODO: How best to translate zodInputType to zodObject?
  const inputSchema = z.object({})
  const outputSchema = z.object({})

  const dynamicToolInput: DynamicStructuredToolInput = {
    name: resource.metadata.name,
    description: resource.metadata.description,
    schema: enforceInputSchema ? inputSchema : z.object({}), // TODO: enforcing input schema breaks?
    func: async (
      input: z.infer<typeof inputSchema>
    ): Promise<z.infer<typeof outputSchema>> => {
      console.log(input)
      return await _call(resource, input)
    }
  }
  return new DynamicStructuredTool(dynamicToolInput)
}

export class LangchainToolbox {
  toolbox: Toolbox

  constructor(toolbox: Toolbox) {
    this.toolbox = toolbox
  }

  async getAllTools(): Promise<StructuredTool[]> {
    const resources = await this.toolbox.getToolResources()
    return resources.map((resource) => convertToStructuredTool(resource, false)) // TODO: enforce input schema?
  }
}

export async function createLangchainToolbox(toolbox: Toolbox) {
  return new LangchainToolbox(toolbox)
}
