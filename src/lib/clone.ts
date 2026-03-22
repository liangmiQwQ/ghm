import fs from 'node:fs/promises'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { pathExists } from './fs.js'
import { parseRepoSpec } from './repo-spec.js'

export async function cloneRepo(spec: string, options: { root: string }): Promise<void | string> {
  const parsedSpec = parseRepoSpec(spec)
  if (typeof parsedSpec === 'string') return parsedSpec

  const { owner, repo } = parsedSpec

  const ownerDir = path.join(options.root, owner)
  const repoDir = path.join(ownerDir, repo)

  if (await pathExists(repoDir)) return `Target already exists: ${repoDir}`

  await fs.mkdir(ownerDir, { recursive: true })

  const url = `https://github.com/${owner}/${repo}.git`
  const result = spawnSync('git', ['clone', url, repoDir], { stdio: 'inherit' })

  if (result.error && (result.error as NodeJS.ErrnoException).code === 'ENOENT') {
    return 'git not found in PATH'
  }

  if (typeof result.status === 'number' && result.status !== 0) {
    return `git clone failed (exit ${result.status})`
  }
}
