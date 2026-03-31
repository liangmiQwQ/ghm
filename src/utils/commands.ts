import { x } from 'tinyexec'
import { error } from './error'

export const runCommand = async (command: string, args: string[]) => {
  const result = await x(command, args, { throwOnError: false })
  return { exitCode: result.exitCode ?? 1 }
}

export const ensureToolReady = async (
  command: string,
  args: string[],
  panic = true,
): Promise<boolean> => {
  try {
    const result = await runCommand(command, args)
    if (result.exitCode === 0) {
      return true
    }
  } catch {
    // fall through to standardized error
  }

  if (panic) {
    error(`Required tool "${command}" is unavailable.`, 69)
  }

  return false
}
