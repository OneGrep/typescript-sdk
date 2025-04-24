const { getToolbox } = require('@onegrep/sdk')

// Make sure these environment variables are set
// ONEGREP_API_KEY=your_api_key
// ONEGREP_API_URL=your_api_url (defaults to https://api.onegrep.com)

async function listAllTools() {
  try {
    // Get a toolbox instance
    const toolbox = await getToolbox()

    // List all available tools
    const tools = await toolbox.listAll()

    console.log('Available Tools:')
    console.log('-----------------')

    tools.forEach((tool, index) => {
      console.log(`Tool #${index + 1}:`)
      console.log(`  Name: ${tool.metadata.name}`)
      console.log(`  Integration: ${tool.metadata.integrationName}`)
      console.log(
        `  Description: ${tool.metadata.description || 'No description available'}`
      )
      console.log(`  Version: ${tool.metadata.version || 'Unknown'}`)
      console.log('-----------------')
    })

    // Close the toolbox when finished
    await toolbox.close()
  } catch (error) {
    console.error('Error:', error.message)
  }
}

// Option 1: Using an IIFE (Immediately Invoked Function Expression)
;(async () => {
  await listAllTools()
})().catch((err) => {
  console.error('Unhandled error:', err)
  process.exit(1)
})
