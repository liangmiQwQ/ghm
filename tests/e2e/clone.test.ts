import { describe, expect, test } from 'vitest'
import fs from 'node:fs/promises'
import path from 'node:path'
import { execFixture, tempDir } from '../utils'

describe('ghm clone', () => {
  test('errors on invalid repository format', async () => {
    const result = await execFixture('clone-command', ['clone', 'invalid-repo'])

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('Invalid repository format')
  })

  test('errors when repository already exists', async () => {
    const result = await execFixture('clone-existing-repo', ['clone', 'vuejs/core'])

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain('Repository already exists')
  })

  test('shows help for clone command', async () => {
    const result = await execFixture('clone-command', ['clone', '--help'])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('clone')
  })

  test('successfully clones a repository', async () => {
    const result = await execFixture('clone-command', ['clone', 'octocat/Hello-World'])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('Cloned octocat/Hello-World')

    // Verify the repository was actually cloned to disk
    const stats = await fs.stat(path.join(tempDir, 'octocat/Hello-World'))
    expect(stats.isDirectory()).toBe(true)
  })
})
