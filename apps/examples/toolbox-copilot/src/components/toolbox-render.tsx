import { BasicToolDetails } from '@onegrep/sdk'
import * as React from 'react'

interface ToolboxRenderProps {
  toolDetails: Map<string, BasicToolDetails>
}

export function ToolboxRender({ toolDetails }: ToolboxRenderProps) {
  return (
    <div>
      <h1>Toolbox Details</h1>
      <ul>
        {Array.from(toolDetails.values()).map((tool) => (
          <li key={tool.id}>{tool.name}</li>
        ))}
      </ul>
    </div>
  )
}
