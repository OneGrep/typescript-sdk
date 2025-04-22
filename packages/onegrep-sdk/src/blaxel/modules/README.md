# Blaxel SDK Compatibility Layer

## Overview

This directory contains compatibility wrappers for handling module format conflicts between the ES Modules used in our codebase and CommonJS modules in external dependencies.

## Why This Approach?

The `@blaxel/sdk` package presents a module format compatibility challenge due to how it generates its modules:

1. Our project uses ES Modules (ESM) as specified by `"type": "module"` in our package.json
2. The `@blaxel/sdk` package has an issue in its ESM build where:
   - The package.json specifies `"type": "module"` for ESM consumption
   - However, the actual code in the ESM build still uses CommonJS-style `exports` statements
   - This creates a module format conflict at runtime
3. When imported directly into our ESM codebase, we encounter errors like:
   ```
   ReferenceError: exports is not defined in ES module scope
   This file is being treated as an ES module because it has a '.js' file extension
   and '../node_modules/@blaxel/sdk/dist/esm/package.json' contains "type": "module".
   ```

This is a specific issue with how the Blaxel SDK is generating its modules, where the output files in the ESM build still contain CommonJS-style code despite being marked as ESM.

## Solution

The solution implemented here:

1. Create a subdirectory with `"type": "commonjs"` in its package.json
2. Use CommonJS's `require()` to import the Blaxel SDK in a wrapper file
3. Export the necessary functions and objects
4. Import this wrapper from our ESM code

This approach isolates the CommonJS code to a specific directory while allowing the rest of our codebase to use ES Modules. It works because we're explicitly using the CommonJS module system to load the Blaxel SDK, avoiding the ESM/CommonJS conflict.

## TypeScript Types

The Blaxel SDK defines types in its package, but they aren't properly re-exported in the main module index:

```typescript
// In node_modules/@blaxel/sdk/dist/esm/tools/types.d.ts
export type Tool = {
  name: string
  description: string
  inputSchema: z.ZodObject<any>
  originalSchema: object
  call(input: unknown): Promise<unknown>
}
```

However, this type isn't correctly re-exported in the main index file. This is a common issue with dual package hazard patterns where type definitions don't match the runtime exports.

### Our Solution for Types

Rather than trying to import types directly from `@blaxel/sdk` (which fails), we define the types locally in our code:

```typescript
import { ZodObject } from 'zod'

// This matches the Tool type from Blaxel SDK
interface Tool {
  name: string
  description: string
  inputSchema: ZodObject<any>
  originalSchema: object
  call(input: unknown): Promise<unknown>
}
```

This approach ensures type safety while avoiding the ESM/CommonJS compatibility issues with type imports.

## Usage

Instead of importing directly from `@blaxel/sdk`:

```typescript
// Don't do this - will cause module format conflicts
import { blTools } from '@blaxel/sdk'
```

Import from the wrapper:

```typescript
import * as blaxelSdk from './modules/blaxel-sdk.js'
// Now use blaxelSdk.blTools, etc.
```
