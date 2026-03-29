import { describe, expect, test } from 'vitest'
import { exec, stripAnsi } from '../utils'

describe('ghm shell command', () => {
  test('outputs bash integration', async () => {
    const result = await exec(['shell', 'bash'])
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('ghm shell bash')
    expect(result.stdout).toContain('hello world from ghm')
  })

  test('outputs zsh integration', async () => {
    const result = await exec(['shell', 'zsh'])
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('ghm shell zsh')
    expect(result.stdout).toContain('hello world from ghm')
  })

  test('outputs fish integration', async () => {
    const result = await exec(['shell', 'fish'])
    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('ghm shell fish')
    expect(result.stdout).toContain('hello world from ghm')
  })

  test('errors on invalid shell', async () => {
    const result = await exec(['shell', 'invalid'])
    expect(result.exitCode).toBe(1)
    expect(stripAnsi(result.stderr)).toContain('Invalid shell')
    expect(stripAnsi(result.stderr)).toContain('bash, zsh, fish')
  })
})
