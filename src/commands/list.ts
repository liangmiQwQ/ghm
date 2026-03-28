import { readdirSync } from 'node:fs'
import path from 'node:path'
import pc from 'picocolors'
import type { GlobalUserConfig } from '../config/config'
import { icons, highlight, muted } from '../output/format'

export function runListCommand(config: GlobalUserConfig): void {
  const owners = readDirectoryNames(config.root)

  if (!owners.length) {
    console.log(
      `${icons.warning} ${pc.yellow(`No repositories found under ${highlight(config.root)}`)}`,
    )
    return
  }

  const allRepos: string[] = []
  const ownerRepos = new Map<string, string[]>()

  for (const owner of owners) {
    const ownerPath = path.join(config.root, owner)
    const repos = readDirectoryNames(ownerPath)

    if (repos.length) {
      ownerRepos.set(owner, repos)
      repos.forEach((repo) => allRepos.push(`${owner}/${repo}`))
    }
  }

  if (!allRepos.length) {
    console.log(
      `${icons.warning} ${pc.yellow(`No repositories found under ${highlight(config.root)}`)}`,
    )
    return
  }

  console.log(highlight(config.root))

  const ownerEntries = Array.from(ownerEntriesSorted(ownerRepos))
  const ownerCount = ownerEntries.length

  for (let i = 0; i < ownerCount; i++) {
    const [owner, repos] = ownerEntries[i]
    const isLastOwner = i === ownerCount - 1
    const ownerBranch = isLastOwner ? icons.tree.corner : icons.tree.branch

    console.log(`${ownerBranch} ${pc.bold(owner)}/`)

    const repoCount = repos.length
    for (let j = 0; j < repoCount; j++) {
      const repo = repos[j]
      const isLastRepo = j === repoCount - 1
      const repoPrefix = isLastOwner ? '   ' : `${icons.tree.vertical} `
      const repoBranch = isLastRepo ? icons.tree.corner : icons.tree.branch

      console.log(`${repoPrefix}${repoBranch} ${repo}`)
    }
  }

  const totalRepos = allRepos.length
  const totalOwners = ownerRepos.size
  console.log()
  console.log(
    `${muted(`${totalRepos} repositor${totalRepos === 1 ? 'y' : 'ies'} in ${totalOwners} organization${totalOwners === 1 ? '' : 's'}`)}`,
  )
}

function* ownerEntriesSorted(map: Map<string, string[]>): Generator<[string, string[]]> {
  const sorted = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  for (const entry of sorted) {
    yield entry
  }
}

function readDirectoryNames(dir: string): string[] {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
  } catch {
    return []
  }
}
