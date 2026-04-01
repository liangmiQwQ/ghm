import type { SupportedShell } from '../utils/config'
import type { CommandAliasConfig } from '../utils/alias'
import { buildAliasLines } from '../utils/alias'
import { supportedShells } from '../utils/config'
import { error } from '../utils/error'
import { isConfig, useConfig } from '../state/config'

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
  if (!isConfig()) {
    return {}
  }

  try {
    const config = useConfig()
    return config.alias ?? {}
  } catch {
    return {}
  }
}
