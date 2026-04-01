import { existsSync } from 'node:fs'
import type { GlobalUserConfig } from '../utils/config'
import { getDefaultConfigPath, loadConfig } from '../utils/config'

export function isConfigExisting(): boolean {
  return existsSync(getDefaultConfigPath())
}

export function useConfig(): GlobalUserConfig {
  return loadConfig()
}
