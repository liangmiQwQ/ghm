import { readdirSync } from 'node:fs'
import path from 'node:path'
import pc from 'picocolors'
import type { GlobalUserConfig } from '../config/config'
import { icons, highlight, muted, toTildePath, bold, gray } from '../output/format'

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

  const displayRoot = toTildePath(config.root)
  console.log(`${gray(`Projects in`)} ${highlight(displayRoot)}`)
  console.log()

  const ownerEntries = Array.from(ownerEntriesSorted(ownerRepos))

  for (const [owner, repos] of ownerEntries) {
    console.log(bold(owner))

    for (const repo of repos) {
      console.log(`${muted(` - `)}${repo}`)
    }

    console.log()
  }

  const totalRepos = allRepos.length
  const totalOwners = ownerRepos.size
  console.log(
    `${muted('Found')} ${highlight(totalRepos.toString())} ${muted(`repositor${totalRepos === 1 ? 'y' : 'ies'} in`)} ${highlight(totalOwners.toString())} ${muted(`organization${totalOwners === 1 ? '' : 's'}`)}`,
  )
}

function* ownerEntriesSorted(map: Map<string, string[]>): Generator<[string, string[]]> {
  const sorted = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  for (const entry of sorted) {
    yield [entry[0], entry[1].sort()]
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
