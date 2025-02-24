import { FetchLikeInit } from 'eventsource'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
import { RemoteClientConfig } from './types.js'
import { log } from '@repo/utils'

// Get an SSE transport for a remote client
export const createSSEClientTransport = (
  clientConfig: RemoteClientConfig,
  apiKey: string | undefined,
  ignoreReadyCheck: boolean
) => {
  // Check if the client config reports server as ready
  if (!clientConfig.ready) {
    if (!ignoreReadyCheck) {
      throw new Error(`Server ${clientConfig.name} is not ready`)
    } else {
      log.warn(`Server ${clientConfig.name} reporting as not ready`)
    }
  }

  const url = clientConfig.endpoint
  if (!url) {
    throw new Error('Endpoint is undefined')
  }
  const headers = clientConfig.required_headers || {}
  if (apiKey) {
    log.debug(`Adding api key to headers`)
    headers['X-ONEGREP-API-KEY'] = apiKey
  }

  const fetchLikeWithHeaders = (url: string | URL, init?: FetchLikeInit) => {
    return fetch(url, {
      ...init,
      headers: {
        ...init?.headers,
        ...headers
      }
    })
  }

  const eventSourceInit = {
    withCredentials: false,
    fetch: fetchLikeWithHeaders
  }
  const requestInit = {
    headers: {
      ...headers
    }
  }
  const sse_opts = {
    eventSourceInit: eventSourceInit,
    requestInit: requestInit
  }

  return new SSEClientTransport(new URL(url), sse_opts)
}
