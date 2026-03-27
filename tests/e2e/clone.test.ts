import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, test } from 'vitest'

import { exec } from '../exec'

const tempDirs: string[] = []

afterEach(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true })
  }
  tempDirs.length = 0
})

describe('ghm clone', () => {
  test('clone creates <root>/<owner>/<repo>', async () => {
    const tempDir = createTempDir()
    const rootDir = path.join(tempDir, 'code')
    mkdirSync(rootDir, { recursive: true })
    const configPath = createConfig(tempDir, rootDir)
    const fakeGitDir = createFakeGit(tempDir)

    const result = await exec(['-c', configPath, 'clone', 'vitejs/devtools'], {
      env: {
        PATH: `${fakeGitDir}${path.delimiter}${process.env.PATH || ''}`,
      },
    })

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('Cloned vitejs/devtools')

    const listResult = await exec(['-c', configPath, 'list'])
    expect(listResult.stdout.trim()).toBe('vitejs/devtools')
  })

  test('clone rejects invalid repo format', async () => {
    const tempDir = createTempDir()
    const rootDir = path.join(tempDir, 'code')
    mkdirSync(rootDir, { recursive: true })
    const configPath = createConfig(tempDir, rootDir)

    const result = await exec(['-c', configPath, 'clone', 'vitejs'])

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('Invalid repository format')
  })

  test('clone errors when target exists', async () => {
    const tempDir = createTempDir()
    const rootDir = path.join(tempDir, 'code')
    mkdirSync(path.join(rootDir, 'vitejs', 'devtools'), { recursive: true })
    const configPath = createConfig(tempDir, rootDir)

    const result = await exec(['-c', configPath, 'clone', 'vitejs/devtools'])

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('Repository already exists')
  })
})

function createTempDir(): string {
  const tempDir = mkdtempSync(path.join(os.tmpdir(), 'ghm-e2e-'))
  tempDirs.push(tempDir)
  return tempDir
}

function createConfig(tempDir: string, rootDir: string): string {
  const configPath = path.join(tempDir, 'ghm.json')
  writeFileSync(configPath, JSON.stringify({ root: rootDir }, null, 2), 'utf8')
  return configPath
}

function createFakeGit(tempDir: string): string {
  const fakeGitDir = path.join(tempDir, 'bin')
  const fakeGitPath = path.join(fakeGitDir, 'git')

  mkdirSync(fakeGitDir, { recursive: true })
  writeFileSync(
    fakeGitPath,
    '#!/bin/sh\nif [ "$1" = "clone" ]; then\n  mkdir -p "$3"\n  exit 0\nfi\nexit 1\n',
    'utf8',
  )
  chmodSync(fakeGitPath, 0o755)

  return fakeGitDir
}
