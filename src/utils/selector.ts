import React from 'react'
import { render } from 'ink'
import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { Selector } from '../components/selector'
import { scanRepos, type RepoGroup } from './repos'
import { startSpinner, stopSpinner } from './format'

export function resolveTarget(root: string, target: string, groups: RepoGroup[]): string | null {
  if (target === '.') return root

  // Try as owner or owner/repo path relative to root (max depth 2)
  const segments = target.split('/').filter(Boolean)
  if (segments.length >= 1 && segments.length <= 2) {
    const candidate = path.join(root, ...segments)
    if (existsSync(candidate) && statSync(candidate).isDirectory()) {
      return candidate
    }
  }

  // Search by name: repos first, then owners
  const q = target.toLowerCase()
  for (const group of groups) {
    for (const repo of group.repos) {
      if (repo.name.toLowerCase().includes(q)) return repo.path
    }
  }
  for (const group of groups) {
    if (group.owner.toLowerCase().includes(q)) return group.path
  }

  return null
}

export async function withPathSelector<T>(
  root: string,
  target: string | undefined,
  action: (targetPath: string) => T | Promise<T>,
): Promise<T> {
  const resolvedTarget = target?.trim()

  // If a direct target is provided, resolve it without the UI
  if (resolvedTarget) {
    // TODO: integrate resolveTarget here
    return action(resolvedTarget)
  }

  const spinner = startSpinner('Scanning repositories...')
  const groups = await scanRepos(root)
  stopSpinner(spinner)

  return new Promise<T>((resolve, reject) => {
    const { unmount } = render(
      React.createElement(Selector, {
        root,
        groups,
        onSelect: (selectedPath: string) => {
          setTimeout(() => {
            unmount()
            resolve(action(selectedPath))
          }, 50)
        },
        onCancel: () => {
          setTimeout(() => {
            unmount()
            reject(new Error('Canceled.'))
          }, 50)
        },
      }),
      { exitOnCtrlC: false },
    )
  })
}
