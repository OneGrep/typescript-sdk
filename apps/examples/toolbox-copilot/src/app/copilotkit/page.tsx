'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import {
  useCopilotChat,
  useCopilotAction,
  CatchAllActionRenderProps
} from '@copilotkit/react-core'
import {
  CopilotKitCSSProperties,
  useCopilotChatSuggestions
} from '@copilotkit/react-ui'
import { DefaultToolRender } from '~/components/default-tool-render'
import { ToolboxClient } from '../utils/toolbox-client'
import { BasicToolDetails } from '@onegrep/sdk'

// Lazy load components
const CopilotSidebar = dynamic(
  () => import('@copilotkit/react-ui').then((mod) => mod.CopilotSidebar),
  { ssr: false }
)

const ToolsDisplay = dynamic(
  () => import('~/components/tools-display').then((mod) => mod.ToolsDisplay),
  {
    ssr: true
  }
)

const themeColor = '#6366f1'

// Move styles outside component to prevent recreation
const classes = {
  wrapper:
    'h-screen w-screen flex justify-center items-center flex-col transition-colors duration-300',
  container:
    'bg-white/20 backdrop-blur-md p-8 rounded-2xl shadow-xl max-w-2xl w-full',
  server:
    'bg-white/15 p-4 rounded-xl text-white relative group hover:bg-white/20 transition-all',
  deleteButton:
    'absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center'
}

export default function CopilotKitPage() {
  return (
    <main
      style={
        { '--copilot-kit-primary-color': themeColor } as CopilotKitCSSProperties
      }>
      <YourMainContent />
      <CopilotSidebar
        clickOutsideToClose={false}
        defaultOpen={true}
        labels={{
          title: 'Toolprint Assistant',
          initial: "👋 Hi, there! It's Toolprint Time!"
        }}
      />
    </main>
  )
}

function YourMainContent() {
  const { mcpServers, setMcpServers } = useCopilotChat()

  // Initialize MCP servers
  useEffect(() => {
    setMcpServers([{ endpoint: 'http://localhost:8080' }])
  }, [])

  const removeMcpServer = (url: string) => {
    setMcpServers(mcpServers.filter((server) => server.endpoint !== url))
  }

  // Optimize suggestions to only run when needed
  useCopilotChatSuggestions({
    maxSuggestions: 3,
    instructions:
      "Give the user a short and concise suggestion based on the conversation and your available tools. If you have no tools, don't suggest anything."
  })

  useCopilotAction({
    name: '*',
    render: ({ name, status, args, result }: CatchAllActionRenderProps<[]>) => (
      <DefaultToolRender
        status={status}
        name={name}
        args={args}
        result={result}
      />
    )
  })

  return (
    <div style={{ backgroundColor: themeColor }} className={classes.wrapper}>
      <div className={classes.container}>
        <h1 className='text-4xl font-bold text-white mb-2 text-center'>
          Toolprint Toolbox
        </h1>
        <hr className='border-white/20 my-6' />

        <div className='flex flex-col gap-6'>
          {mcpServers.map((server, index) => (
            <div key={index}>
              <div className={classes.server}>
                <p className='pr-8 truncate'>{server.endpoint}</p>
                <button
                  className={classes.deleteButton}
                  onClick={() => removeMcpServer(server.endpoint)}>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
