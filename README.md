<div align="center">
  <img src="assets/onegrep.png" alt="OneGrep Logo" width="200"/>

# OneGrep TypeScript SDK

[![Release](https://img.shields.io/github/v/release/OneGrep/typescript-sdk)](https://img.shields.io/github/v/release/OneGrep/typescript-sdk)
[![Build status](https://img.shields.io/github/actions/workflow/status/OneGrep/typescript-sdk/main.yml?branch=main)](https://github.com/OneGrep/typescript-sdk/actions/workflows/main.yml?query=branch%3Amain)
[![codecov](https://codecov.io/gh/OneGrep/typescript-sdk/branch/main/graph/badge.svg)](https://codecov.io/gh/OneGrep/typescript-sdk)
[![PNPM](https://img.shields.io/badge/pnpm-v10.4.1-orange)](https://pnpm.io)
[![Node](https://img.shields.io/badge/node-%3E%3D22.14.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)](https://www.typescriptlang.org)
[![License](https://img.shields.io/github/license/OneGrep/typescript-sdk)](https://img.shields.io/github/license/OneGrep/typescript-sdk)

**Build agents that pick tools like experts, secure by default**

_Import a single SDK to power your agents with semantic tool search, trainable contexts, and feedback-driven selection that gets smarter over time. Access tools from any provider through a unified API with configurable security policies and guardrails._

[Documentation](https://onegrep.github.io/typescript-sdk/) |
[API Reference](https://onegrep.github.io/typescript-sdk/api) |
[Getting Started](#getting-started) |
[Join our Community](https://join.slack.com/t/onegrep-community/shared_invite/placeholder)

</div>

## 📚 Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
- [Supported Providers](#supported-providers)
- [Security & Guardrails](#security--guardrails)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🎯 Intelligent Tool Selection

- **Semantic Search**: Find the right tools based on natural language descriptions and agent goals
- **Context Training**: Train custom tool contexts to improve selection accuracy for your specific use cases
- **Feedback Learning**: Selection gets smarter over time by learning from agent interactions and success patterns
- **Adaptive Ranking**: Tools are ranked based on historical performance and contextual relevance

### 🔌 Universal Connectivity

- **Multi-Provider Support**: Connect to any [supported provider](#supported-providers) through a single unified API
- **Type-Safe Integration**: Full TypeScript support with type definitions for all API operations
- **Simple Authentication**: Unified authentication handling across all providers
- **Provider Agnostic**: Write code once, switch providers anytime
- **OpenAPI Integration** `coming soon`: Register any OpenAPI server as a tool source automatically

### 🛡️ Security & Control

- **Guardrails & Access Control**: Configure tool execution rules and approval flows - from automatic execution to human-in-the-loop oversight
- **Audit Logging**: Comprehensive logging of all tool selections and executions
- **Network Security**: Secure HTTPS connections with JWT and API key-based authentication schemes

## 🚀 Getting Started

### Join the Sandbox

1. **Request Access**

   - Visit [onegrep.dev](https://www.onegrep.dev/) to join the waitlist
   - You'll receive an invite to the OneGrep sandbox environment

2. **Install the CLI**

```bash
# Install the OneGrep CLI
npx -y @onegrep/cli onegrep-cli

# Create your account
npx @onegrep/cli account
# Select "Create Account" when prompted
```

### Sandbox Environment

The OneGrep sandbox comes pre-configured with:

- A collection of popular AI tools across different categories (chat, search, code analysis, etc.)
- Example tool contexts trained for common agent scenarios
- Pre-configured security policies and guardrails
- Sample agent implementations using different frameworks

### Exploring the Sandbox

Let's try out some common workflows using the CLI:

#### 1. Search for Tools

Find tools that match your agent's goals using natural language:

```bash
# Start the CLI tool explorer
npx @onegrep/cli tools

# Select "search" from the menu
# Enter your query when prompted:
"I want to be able to find recent issues in the MCP repository and what the web says about how to fix them"

# The CLI will return ranked tools matching your query
```

#### 2. Execute Tools

Try out tools directly from the CLI:

```bash
# Start the CLI tool explorer
npx @onegrep/cli tools

# Select "Explore integrations"
# Select "exa" from the list
# Enter your query when prompted:
"what are the recent developments in MCP"

# The tool will execute and return results
```

#### 3. Train Tool Context

Improve tool selection by adding custom context:

```bash
# Start the CLI tool explorer
npx @onegrep/cli tools

# Select "Explore integrations"
# Select any tool
# Choose "Add property"
# Create a new property (e.g., "use_case")
# Add a value (e.g., "mcp monitoring")

# Now search again:
npx @onegrep/cli tools
# Select "search"
# Try a query related to your tag:
"I need to monitor MCP status"

# Your trained tool should appear at the top of the results
```

### Using the SDK

Once you have sandbox access, install the SDK:

```bash
# Install using PNPM
pnpm add @onegrep/sdk
```

Set up your environment:

```bash
# Get your API key from the CLI
npx @onegrep/cli account
# Select "Show authentication status"
# Your API key will be displayed

# Set the API key in your environment
export ONEGREP_API_KEY="your_sandbox_api_key"
```

#### Run an Agent

Let's start with a complete example of running an agent that uses OneGrep for dynamic tool selection. This example uses LangChain for the agent loop and Blaxel for managing the agent runtime.

First, install the Just command runner:

```bash
# macOS (using Homebrew)
brew install just

# Linux
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash

# Windows (using Chocolatey)
choco install just
```

Then run the example agent:

```bash
# Terminal 1: Start the agent server
just bl-serve

# Terminal 2: Open a chat session with the agent
just bl-chat
```

This will start a local agent that:

- Uses OneGrep SDK for intelligent tool selection
- Implements a ReAct agent loop with LangChain
- Runs in a secure Blaxel runtime environment

#### LangChain Integration

OneGrep seamlessly integrates with runtimes like `Langchain` and `CrewAI`, allowing your agents to discover and use tools intelligently:

```typescript
import { createToolbox } from '@onegrep/sdk'
import { createLangchainToolbox } from '@onegrep/sdk/extensions/langchain'

// Initialize the toolboxes
const toolbox = await createToolbox()
const langchainToolbox = await createLangchainToolbox(toolbox)

// Search for relevant tools based on your agent's goals
const searchResults = await toolbox.search(
  'Find recent news about AI developments'
)

// Convert to LangChain structured tools
const tools = await Promise.all(
  searchResults.map(async (result) => {
    return langchainToolbox.get(result.id)
  })
)

// Use tools in your LangChain agent
const agent = await createReactAgent({
  llm: yourLLM,
  tools: tools,
  prompt: 'Use the most relevant tool to help the user.'
})

// Tools are now available to your agent with proper typing and validation
const result = await agent.invoke({
  input: "What's the latest news about LangChain?"
})
```

For more examples and detailed API documentation, check out our [Documentation](https://onegrep.github.io/typescript-sdk/).

## 🔗 Supported Providers

OneGrep integrates with the following tool providers:

### [Blaxel](https://blaxel.ai)

The AI-first tool hosting platform with built-in security and scalability. Blaxel provides a wide range of pre-built tools and supports custom tool deployment.

### [Smithery](https://smithery.dev)

A modern tool hosting platform focused on developer experience and enterprise features. Smithery offers extensive tool management capabilities and robust security controls.

Want to add support for your tool hosting platform? [Get in touch](https://join.slack.com/t/onegrep-community/shared_invite/placeholder)!

## 📖 Next Steps

Ready to explore more advanced capabilities? Check out our [API Reference](https://onegrep.github.io/typescript-sdk/api) to learn about:
- Advanced filtering and search options
- Custom tool context training
- Batch operations and error handling
- Security policy configuration
- And more!

## 📝 License

[MIT](LICENSE)
