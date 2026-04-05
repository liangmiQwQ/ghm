import { existsSync } from 'node:fs'
import { ensureToolReady } from './commands'
import { error } from './error'
import { tmpdir } from 'node:os'
import path from 'node:path'

export const userBinName = 'mo'
export const innerBinName = 'mo-inner'

export async function preventRunning() {
  if (process.platform === 'win32') {
    error('Windows is not supported. mo currently supports macOS and Linux only.', 69)
  }

  try {
    const hasInner = await ensureToolReady(innerBinName, false)
    const hasUser = await ensureToolReady(userBinName, false)

    if (!hasInner || !hasUser) {
      throw new Error() // Trigger catch block
    }
  } catch {
    error('Local installation is not supported. Please install mo globally.', 78)
  }
}

export function getRestartFlagPath() {
  return path.join(tmpdir(), 'mo-restart-flag')
}

export function checkRestartRequired(): void {
  const flagPath = getRestartFlagPath()
  if (existsSync(flagPath)) {
    error('Please restart your shell to apply the recent setup changes.')
  }
}
