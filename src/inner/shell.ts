import { existsSync } from 'node:fs'
import type { SupportedShell } from '../utils/config'
import type { CommandAliasConfig } from '../utils/alias'
import { buildAliasLines } from '../utils/alias'
import { getDefaultConfigPath, loadConfig, supportedShells } from '../utils/config'
import { error } from '../utils/error'

export function generateShellIntegration(shell: string): string {
  if (!isValidShell(shell)) {
    error(`Invalid shell "${shell}". Supported: ${supportedShells.join(', ')}`)
  }

  const aliases = loadAliasConfig()
  if (shell === 'bash' || shell === 'zsh') {
    return generateBashZshIntegration(aliases)
  } else {
    return generateFishIntegration(aliases)
  }
}

function generateBashZshIntegration(aliases: CommandAliasConfig): string {
  const lines = buildAliasLines(aliases, (name, target) => `alias ${name}='${target}'`)
  return ['# ghm shell integration script', ...lines, ''].join('\n')
}

function generateFishIntegration(aliases: CommandAliasConfig): string {
  const lines = buildAliasLines(aliases, (name, target) => `alias ${name} '${target}'`)
  return ['# ghm shell integration script', ...lines, ''].join('\n')
}

function isValidShell(shell: string): shell is SupportedShell {
  return supportedShells.includes(shell as SupportedShell)
}

function loadAliasConfig(): CommandAliasConfig {
  const configPath = getDefaultConfigPath()
  if (!existsSync(configPath)) {
    return {}
  }

  try {
    const config = loadConfig()
    return config.alias ?? {}
  } catch {
    return {}
  }
}
