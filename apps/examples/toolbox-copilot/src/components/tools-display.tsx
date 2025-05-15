'use client'

import { BasicToolDetails } from '@onegrep/sdk'

interface ToolsDisplayProps {
  tools: Map<string, BasicToolDetails>
}

export function ToolsDisplay({ tools }: ToolsDisplayProps) {
  if (tools.size === 0) return null

  return (
    <div>
      <h1>Toolbox Details</h1>
      <ul>
        {Array.from(tools.values()).map((tool) => (
          <li key={tool.id}>{tool.name}</li>
        ))}
      </ul>
    </div>
  )
}
