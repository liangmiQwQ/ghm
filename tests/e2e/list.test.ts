import { describe, expect, test } from 'vitest'
import { execFixture } from '../utils'

describe('ghm list', () => {
  test('lists all repositories in root directory', async () => {
    const result = await execFixture('list-command', ['list'])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('vitejs')
    expect(result.stdout).toContain('vite')
    expect(result.stdout).toContain('vuejs')
    expect(result.stdout).toContain('core')
    expect(result.stdout).toContain('router')
  })

  test('lists repositories in sorted order', async () => {
    const result = await execFixture('list-command', ['list'])

    expect(result.exitCode).toBe(0)
    const lines = result.stdout.trim().split('\n').filter(Boolean)

    // Check that vitejs appears before vuejs (alphabetical order)
    const vitejsIndex = lines.findIndex((line) => line.includes('vitejs'))
    const vuejsIndex = lines.findIndex((line) => line.includes('vuejs'))
    expect(vitejsIndex).toBeLessThan(vuejsIndex)

    // Check that repos under vuejs are sorted (core comes before router)
    const coreIndex = lines.findIndex((line) => line.includes('core'))
    const routerIndex = lines.findIndex((line) => line.includes('router'))
    expect(coreIndex).toBeLessThan(routerIndex)
  })

  test('shows repository count summary', async () => {
    const result = await execFixture('list-command', ['list'])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain('3 repositories')
    expect(result.stdout).toContain('2 organizations')
  })
})
