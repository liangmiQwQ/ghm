import { existsSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

export function getCdPath(): string {
  const targetFile = path.join(tmpdir(), 'mo-cd-target')
  if (!existsSync(targetFile)) {
    return '.'
  }

  const pending = readFileSync(targetFile, 'utf8').trim()
  rmSync(targetFile)

  if (!pending) {
    return '.'
  }

  return pending
}
