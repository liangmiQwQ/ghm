import path from 'node:path'
import fs from 'node:fs/promises'
import { x } from 'tinyexec'

export type ExecResult = {
  stdout: string
  stderr: string
  exitCode: number | undefined
}

export async function exec(
  args: string[],
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {},
) {
  // Clean temp dir
  const tempDir = path.join(import.meta.dirname, 'fixtures/.temp')
  await fs.rm(tempDir, { recursive: true, force: true })
  await fs.mkdir(tempDir, { recursive: true })

  const cwd = options.cwd ?? process.cwd()
  const env = options.env ? { ...process.env, ...options.env } : process.env

  const output = await x('node', ['bin/cli.mjs', ...args], {
    throwOnError: false,
    nodeOptions: {
      cwd,
      env,
    },
  })

  return {
    stdout: output.stdout,
    stderr: output.stderr,
    exitCode: output.exitCode,
  }
}

export function execWithConfig(
  args: string[],
  configPath: string,
  options: { cwd?: string; env?: NodeJS.ProcessEnv } = {},
) {
  return exec(['--config', configPath, ...args], options)
}

export function execFixture(name: string, args: string[]) {
  const cwd = path.join(import.meta.dirname, 'fixtures', name)
  const configPath = path.join(cwd, 'ghmrc.json')
  return execWithConfig(args, configPath, { cwd })
}
