import { describe, expect, test } from 'vitest'
import { exec } from '../utils'

describe('ghm config', () => {
  test('--config reports missing file', async () => {
    const result = await exec(['--config', '/path/not-found/ghmrc.json', 'list'])

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain(`Couldn't find config file`)
  })
})
