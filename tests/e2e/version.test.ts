import { describe, expect, test } from 'vitest'
import { version } from '../../package.json'

import { exec } from '../utils'

describe('ghm cli', () => {
  test('--version', async () => {
    const result = await exec(['--version'])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).include(version)
  })
})
