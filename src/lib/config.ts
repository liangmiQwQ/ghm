import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { isDirectory } from './fs.js'
import { expandTilde } from './path.js'

export type GhmConfig = {
  root: string
}

export type ReadConfigOptions = {
  configPath?: string
}

export function defaultConfigPath(): string {
  return path.join(os.homedir(), '.config', 'ghm.json')
}

export async function readConfig(options: ReadConfigOptions = {}): Promise<GhmConfig | string> {
  const configPath = options.configPath ?? process.env.GHM_CONFIG_PATH ?? defaultConfigPath()

  let raw: string
  try {
    raw = await fs.readFile(configPath, 'utf8')
  } catch {
    return `Missing config: ${configPath}`
  }

  if (!raw.trim()) return `Empty config: ${configPath}`

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return `Invalid JSON in config: ${configPath}`
  }

  if (!parsed || typeof parsed !== 'object') return `Invalid config: ${configPath}`

  const root = (parsed as { root?: unknown }).root
  if (typeof root !== 'string' || !root.trim()) return `Invalid "root" in config: ${configPath}`

  const expandedRoot = path.resolve(expandTilde(root.trim()))
  if (!(await isDirectory(expandedRoot))) return `Invalid "root" path: ${expandedRoot}`

  return { root: expandedRoot }
}
