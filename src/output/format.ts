import pc from 'picocolors'

export const icons = {
  success: pc.green('✓'),
  error: pc.red('✗'),
  warning: pc.yellow('⚠'),
  info: pc.cyan('ℹ'),
  arrow: pc.dim('→'),
  bullet: pc.dim('•'),
  tree: {
    branch: pc.dim('├─'),
    corner: pc.dim('└─'),
    vertical: pc.dim('│ '),
  },
}

const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

export interface Spinner {
  interval: NodeJS.Timeout
  message: string
}

export function startSpinner(message: string): Spinner {
  let frameIndex = 0
  const interval = setInterval(() => {
    const frame = pc.cyan(spinnerFrames[frameIndex])
    process.stdout.write(`\r${frame} ${message}`)
    frameIndex = (frameIndex + 1) % spinnerFrames.length
  }, 80)

  return { interval, message }
}

export function stopSpinner(spinner: Spinner): void {
  clearInterval(spinner.interval)
  process.stdout.write('\r' + ' '.repeat(spinner.message.length + 2) + '\r')
}

export function success(message: string): void {
  console.log(`${icons.success} ${pc.green(message)}`)
}

export function info(message: string): void {
  console.log(`${icons.info} ${pc.cyan(message)}`)
}

export function dim(message: string): void {
  console.log(pc.dim(message))
}

export function bold(message: string): string {
  return pc.bold(message)
}

export function highlight(path: string): string {
  return pc.cyan(path)
}

export function muted(text: string): string {
  return pc.dim(text)
}
