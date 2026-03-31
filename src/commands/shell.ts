import type { GlobalUserConfig, SupportedShell } from '../utils/config'
import { supportedShells } from '../utils/config'
import { error } from '../utils/error'

export function generateShellIntegration(shell: string, config: GlobalUserConfig): string {
  if (!isValidShell(shell)) {
    error(`Invalid shell "${shell}". Supported: ${supportedShells.join(', ')}`)
  }
  if (!config.shells.includes(shell)) {
    error(
      `Shell "${shell}" is not enabled in config "shells". Enabled: ${config.shells.join(', ')}`,
    )
  }

  if (shell === 'bash' || shell === 'zsh') {
    return generateBashZshIntegration()
  } else {
    return generateFishIntegration()
  }
}

function generateBashZshIntegration(): string {
  return `# ghm shell integration script
`
}

function generateFishIntegration(): string {
  return `# ghm shell integration script
`
}

export function isValidShell(shell: string): shell is SupportedShell {
  return supportedShells.includes(shell as SupportedShell)
}
