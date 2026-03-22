import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, expect, test, vi } from 'vite-plus/test'
import { main as cliMain } from '../src/cli'
import { listRepos, parseRepoSpec, readConfig } from '../src'

let createdPaths: string[] = []

afterEach(async () => {
  await Promise.all(
    createdPaths.map(async (p) => {
      try {
        await fs.rm(p, { recursive: true, force: true })
      } catch {
        // ignore
      }
    }),
  )
  createdPaths = []
})

async function runCli(argv: string[]): Promise<{ code: number; stdout: string; stderr: string }> {
  let stdout = ''
  let stderr = ''
  let exitCode: number | undefined

  const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation((chunk: unknown) => {
    stdout += String(chunk)
    return true
  })
  const stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation((chunk: unknown) => {
    stderr += String(chunk)
    return true
  })
  const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((code?: number) => {
    exitCode = code ?? 0
    return undefined as never
  }) as never)

  try {
    const code = await cliMain(argv)
    return { code: exitCode ?? code, stdout, stderr }
  } finally {
    stdoutSpy.mockRestore()
    stderrSpy.mockRestore()
    exitSpy.mockRestore()
  }
}

test('parseRepoSpec', () => {
  expect(parseRepoSpec('vitejs/vite')).toEqual({ owner: 'vitejs', repo: 'vite' })
  expect(parseRepoSpec('vitejs/vite.git')).toEqual({ owner: 'vitejs', repo: 'vite' })

  expect(parseRepoSpec('')).toBeTypeOf('string')
  expect(parseRepoSpec('vitejs')).toBeTypeOf('string')
  expect(parseRepoSpec('vitejs/vite/extra')).toBeTypeOf('string')
})

test('listRepos lists owner/repo dirs', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ghm-root-'))
  createdPaths.push(root)

  await fs.mkdir(path.join(root, 'vitejs', 'vite'), { recursive: true })
  await fs.mkdir(path.join(root, 'vuejs', 'core'), { recursive: true })
  await fs.mkdir(path.join(root, '.hidden', 'ignore'), { recursive: true })

  await fs.writeFile(path.join(root, 'not-a-dir'), 'x')

  const repos = await listRepos(root)
  expect(repos).toEqual(['vitejs/vite', 'vuejs/core'])
})

test('readConfig validates config file and root', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ghm-root-'))
  const configDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ghm-config-'))
  createdPaths.push(root, configDir)

  const configPath = path.join(configDir, 'ghm.json')
  await fs.writeFile(configPath, JSON.stringify({ root }, null, 2))

  const config = await readConfig({ configPath })
  expect(config).not.toBeTypeOf('string')
  if (typeof config === 'string') throw new Error(config)
  expect(config.root).toBe(root)

  await fs.writeFile(configPath, JSON.stringify({ root: path.join(root, 'nope') }, null, 2))
  const invalidConfig = await readConfig({ configPath })
  expect(invalidConfig).toBeTypeOf('string')
})

test('cli --help prints help', async () => {
  const result = await runCli(['--help'])
  expect(result.code).toBe(0)
})

test('cli unknown command exits with code 2', async () => {
  const result = await runCli(['nope'])
  expect(result.code).toBe(2)
  expect(result.stdout).toBe('')
  expect(result.stderr).toContain('Unknown command')
})
