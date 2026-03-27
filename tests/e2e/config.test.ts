import { describe, expect, test } from 'vitest'
import { exec } from '../exec'

describe('ghm config', () => {
  test('--config loads custom config path', async () => {
    const configPath = 'tests/fixtures/config/valid.json'

    const result = await exec(['--config', configPath, 'list'])

    expect(result.exitCode).toBe(0)
    expect(result.stdout.trim()).toBe('vitejs/vite')
  })

  test('--config reports missing file', async () => {
    const result = await exec(['--config', '/path/not-found/ghm.json', 'list'])

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain(`Couldn't find config file`)
  })
})
