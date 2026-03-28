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
