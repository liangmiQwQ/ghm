import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
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

describe('ghm list', () => {
  test('list shows empty state', async () => {
    const tempDir = createTempDir()
    const rootDir = path.join(tempDir, 'code')
    mkdirSync(rootDir, { recursive: true })
    const configPath = createConfig(tempDir, rootDir)

    const result = await exec(['-c', configPath, 'list'])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('No repositories found')
  })

  test('list outputs sorted owner/repo pairs', async () => {
    const tempDir = createTempDir()
    const rootDir = path.join(tempDir, 'code')

    mkdirSync(path.join(rootDir, 'vuejs', 'core'), { recursive: true })
    mkdirSync(path.join(rootDir, 'vitejs', 'vite'), { recursive: true })
    mkdirSync(path.join(rootDir, 'vuejs', 'router'), { recursive: true })

    const configPath = createConfig(tempDir, rootDir)

    const result = await exec(['-c', configPath, 'list'])

    expect(result.exitCode).toBe(0)
    expect(result.stdout.trim().split('\n')).toEqual(['vitejs/vite', 'vuejs/core', 'vuejs/router'])
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
