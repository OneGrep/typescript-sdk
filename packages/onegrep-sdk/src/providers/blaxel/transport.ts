import { env } from 'process'

import { BlaxelMcpClientTransport, settings } from '@blaxel/sdk'
import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js'

/**
 * Utility class for getting the Blaxel MCP client transport URLs.
 *
 * Extracted from SDK code here:
 * https://github.com/beamlit/sdk-typescript/blob/9c5a363d705cd1ad49e829a4f02c33a788831294/src/tools/mcpTool.ts#L36
 */
class BlaxelUrlUtils {
  // Name is the name of the Blaxel function
  constructor(
    private readonly name: string,
    private readonly blaxelSettings: typeof settings = settings
  ) {}

  get fallbackUrl() {
    if (this.externalUrl != this.url) {
      return this.externalUrl
    }
    return null
  }

  get externalUrl() {
    const envVar = this.name.replace(/-/g, '_').toUpperCase()
    if (env[`BL_FUNCTION_${envVar}_URL`]) {
      return new URL(env[`BL_FUNCTION_${envVar}_URL`] as string)
    }
    return new URL(
      `${this.blaxelSettings.runUrl}/${this.blaxelSettings.workspace}/functions/${this.name}`
    )
  }

  get url() {
    const envVar = this.name.replace(/-/g, '_').toUpperCase()
    if (env[`BL_FUNCTION_${envVar}_URL`]) {
      return new URL(env[`BL_FUNCTION_${envVar}_URL`] as string)
    }
    if (env[`BL_FUNCTION_${envVar}_SERVICE_NAME`]) {
      return new URL(
        `https://${env[`BL_FUNCTION_${envVar}_SERVICE_NAME`]}.${
          this.blaxelSettings.runInternalHostname
        }`
      )
    }
    return this.externalUrl
  }
}

/**
 * Creates a Blaxel MCP client transport and fallback transport.
 *
 * Extracted from SDK code here:
 * https://github.com/beamlit/sdk-typescript/blob/9c5a363d705cd1ad49e829a4f02c33a788831294/src/tools/mcpTool.ts#L92
 */
export function createBlaxelMcpClientTransports(
  functionName: string,
  headers: Record<string, string> = settings.headers
): Transport[] {
  const urlUtils = new BlaxelUrlUtils(functionName)
  const transports = [
    new BlaxelMcpClientTransport(urlUtils.url.toString(), headers)
  ]
  if (urlUtils.fallbackUrl) {
    transports.push(
      new BlaxelMcpClientTransport(urlUtils.fallbackUrl.toString(), headers)
    )
  }
  return transports
}
