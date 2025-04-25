import { createApiClientFromParams } from '../core/api/client.js'
import { BlaxelToolCache } from './toolcache.js'
import { describe, expect, it } from 'vitest'

describe('BlaxelToolCacheTests', () => {
  it('should refresh the tool cache', async () => {
    const apiClient = createApiClientFromParams({
      apiKey: "13789b1893d77f11dfd09c84766b247f310da6c50bc6d41fbfed2c3ea4b157d4", //"ae2823da905634d60f9b14128e5bbd61d99bfb49b153df3afbee680496e3414d", //process.env.ONEGREP_API_KEY,
      baseUrl: "http://localhost:8080" // "https://test-sandbox.onegrep.dev" //process.env.ONEGREP_BASE_URL!
    })
    const tc = new BlaxelToolCache(apiClient)
    await tc.refresh()
    const tools = await tc.list()
    console.log(JSON.stringify(tools, null, 2))
    expect(true).toBe(true)
  }, 60000) // 60 second timeout
})
