import { describe, expect, test, vi } from 'vitest'
import { runPreinstallChecks } from '../src/preinstall'

function createFailSpy() {
  return vi.fn((message: string, exitCode: number = 1) => {
    throw new Error(`${exitCode}:${message}`)
  })
}

describe('preinstall', () => {
  test('blocks installation on Windows', () => {
    const fail = createFailSpy()

    expect(() =>
      runPreinstallChecks({
        platform: 'win32',
        env: { npm_config_global: 'true' },
        cwd: '/tmp/ghm',
        fail: fail as unknown as (message: string, exitCode?: number) => never,
      }),
    ).toThrow('69:Windows is not supported.')
  })

  test('blocks local install outside source repo', () => {
    const fail = createFailSpy()

    expect(() =>
      runPreinstallChecks({
        platform: 'darwin',
        env: {
          npm_config_global: 'false',
          INIT_CWD: '/tmp/user-project',
        },
        cwd: '/tmp/user-project/node_modules/@liangmi/ghm',
        fail: fail as unknown as (message: string, exitCode?: number) => never,
      }),
    ).toThrow('78:Local installation is not supported.')
  })

  test('allows global install on supported platform', () => {
    expect(() =>
      runPreinstallChecks({
        platform: 'linux',
        env: { npm_config_global: 'true' },
        cwd: '/tmp/ghm',
        fail: createFailSpy() as unknown as (message: string, exitCode?: number) => never,
      }),
    ).not.toThrow()
  })

  test('allows contributor install in source repo', () => {
    expect(() =>
      runPreinstallChecks({
        platform: 'darwin',
        env: {
          npm_config_global: 'false',
          INIT_CWD: '/Users/dev/ghm',
        },
        cwd: '/Users/dev/ghm',
        fail: createFailSpy() as unknown as (message: string, exitCode?: number) => never,
      }),
    ).not.toThrow()
  })
})
