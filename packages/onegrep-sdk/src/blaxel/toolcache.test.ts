import { createApiClientFromParams } from "../core/api/client.js"
import { BlaxelToolResource } from "./resource.js"
import { BlaxelToolCache } from "./toolcache.js"
import { describe, expect, it } from "vitest"


describe('BlaxelToolCacheTests', () => {
    it('should refresh the tool cache', async () => {
        const apiClient = createApiClientFromParams({
            apiKey: 'ae2823da905634d60f9b14128e5bbd61d99bfb49b153df3afbee680496e3414d',
            baseUrl: 'https://test-sandbox.onegrep.dev',
        })
        const tc = new BlaxelToolCache(apiClient)

        await tc.refresh()
        expect(true).toBe(true)
    })
})
