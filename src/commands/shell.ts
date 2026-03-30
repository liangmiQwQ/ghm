import type { GlobalUserConfig, SupportedShell } from '../utils/config'
import { supportedShells } from '../utils/config'
import { error } from '../utils/error'

export function generateShellIntegration(
  shell: string,
  binName: string,
  config: GlobalUserConfig,
): string {
  if (!isValidShell(shell)) {
    error(`Invalid shell "${shell}". Supported: ${supportedShells.join(', ')}`)
  }
  if (!config.shells.includes(shell)) {
    error(
      `Shell "${shell}" is not enabled in config "shells". Enabled: ${config.shells.join(', ')}`,
    )
  }

  if (shell === 'bash' || shell === 'zsh') {
    return generateBashZshIntegration(binName)
  } else {
    return generateFishIntegration(binName)
  }
}

function generateBashZshIntegration(binName: string): string {
  return `# ghm shell integration
# Add this to your .bashrc or .zshrc:
# source <(${binName} shell bash)  # for bash
# source <(${binName} shell zsh)   # for zsh
`
}

function generateFishIntegration(binName: string): string {
  return `# ghm shell integration
# Add this to your config.fish:
# ${binName} shell fish | source
`
}

export function isValidShell(shell: string): shell is SupportedShell {
  return supportedShells.includes(shell as SupportedShell)
}
