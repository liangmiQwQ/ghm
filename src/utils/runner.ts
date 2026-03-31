import { ensureToolReady } from './commands'
import { error } from './error'

export const userBinName = 'ghm'
export const innerBinName = 'ghmi'

export async function preventRunning() {
  if (process.platform === 'win32') {
    error('Windows is not supported. ghm currently supports macOS and Linux only.', 69)
  }

  try {
    await ensureToolReady(innerBinName, ['--version'])
    await ensureToolReady(userBinName, ['--version'])
  } catch {
    error('Local installation is not supported. Please install ghm globally.', 78)
  }
}
