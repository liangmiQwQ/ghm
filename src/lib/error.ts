export interface GhmError extends Error {
  exitCode: number
}

export function isGhmError(error: unknown): error is GhmError {
  return (
    error instanceof Error &&
    error.name === 'GhmError' &&
    typeof (error as { exitCode?: unknown }).exitCode === 'number'
  )
}

export function GhmError(message: string, exitCode = 1): GhmError {
  const error = new Error(message) as GhmError
  error.name = 'GhmError'
  error.exitCode = exitCode
  return error
}

Object.defineProperty(GhmError, Symbol.hasInstance, {
  value: isGhmError,
})
