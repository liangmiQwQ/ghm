type OutputLevel = 'warn' | 'error'

function shouldColor(stream: NodeJS.WriteStream): boolean {
  if (process.env.NO_COLOR) return false
  if (process.env.FORCE_COLOR && process.env.FORCE_COLOR !== '0') return true
  return Boolean(stream.isTTY)
}

function wrapAnsi(text: string, open: string, close = '\x1b[0m'): string {
  return `${open}${text}${close}`
}

function formatLine(level: OutputLevel, message: string, enableColor: boolean): string {
  const prefix = enableColor ? wrapAnsi('ghm', '\x1b[2m') : 'ghm'

  if (!enableColor) {
    const tag = level.toUpperCase()
    return `[${prefix}] ${tag} ${message}`
  }

  const tag =
    level === 'warn'
      ? wrapAnsi(' WARN ', '\x1b[30m\x1b[43m\x1b[1m')
      : wrapAnsi(' ERROR ', '\x1b[97m\x1b[41m\x1b[1m')

  return `[${prefix}]${tag} ${message}`
}

function writeStderr(line: string): void {
  process.stderr.write(`${line}\n`)
}

export function warn(message: string): void {
  writeStderr(formatLine('warn', message, shouldColor(process.stderr)))
}

export function error(message: string, exitCode: number): never {
  writeStderr(formatLine('error', message, shouldColor(process.stderr)))
  process.exit(exitCode)
}
