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

## 🔗 Supported Providers

OneGrep integrates with the following tool providers:

### [Blaxel](https://blaxel.ai)

The AI-first tool hosting platform with built-in security and scalability. Blaxel provides a wide range of pre-built tools and supports custom tool deployment.

### [Smithery](https://smithery.dev)

A modern tool hosting platform focused on developer experience and enterprise features. Smithery offers extensive tool management capabilities and robust security controls.

Want to add support for your tool hosting platform? [Get in touch](https://join.slack.com/t/onegrep-community/shared_invite/placeholder)!

## 📝 License

[MIT](LICENSE)
