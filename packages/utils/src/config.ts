import { getEnv, configSchema } from './env.js'

export const getConfigDir = async () => {
  const path = await import('path')
  const os = await import('os')

  const env = getEnv(configSchema)
  if (env.ONEGREP_CONFIG_DIR) {
    return env.ONEGREP_CONFIG_DIR
  }
  return path.join(os.homedir(), '.onegrep') // Default is ~/.onegrep
}

export const initConfigDir = async () => {
  const fs = await import('fs')
  const userCfgDir = await getConfigDir()
  // Ensure directory exists before writing to it
  if (!fs.existsSync(userCfgDir)) {
    fs.mkdirSync(userCfgDir, { recursive: true })
  }
  return userCfgDir
}
