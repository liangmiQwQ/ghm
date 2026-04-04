import { readdirSync } from 'node:fs'
import path from 'node:path'
import {
  Separator,
  createPrompt,
  isDownKey,
  isEnterKey,
  isUpKey,
  makeTheme,
  useMemo,
  usePagination,
  useKeypress,
  usePrefix,
  useState,
} from '@inquirer/core'
import figures from '@inquirer/figures'
import pc from 'picocolors'
import { error } from './error'

// ---- Types ----

type OwnerGroup = {
  name: string
  path: string
  repos: Array<{ name: string; path: string }>
}

type LocationChoice = {
  value: string
  name: string
  short: string
  group: string | null
}

type ListItem = LocationChoice | Separator

// ---- Filesystem helpers ----

function readDirNames(dir: string): string[] {
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort()
  } catch {
    return []
  }
}

export function collectOwnerGroups(root: string): OwnerGroup[] {
  return readDirNames(root).map((owner) => {
    const ownerPath = path.join(root, owner)
    return {
      name: owner,
      path: ownerPath,
      repos: readDirNames(ownerPath).map((repo) => ({
        name: repo,
        path: path.join(ownerPath, repo),
      })),
    }
  })
}

// ---- Item builders ----

function isSelectable(item: ListItem): item is LocationChoice {
  return !Separator.isSeparator(item)
}

function buildBrowseItems(root: string, groups: OwnerGroup[]): ListItem[] {
  const items: ListItem[] = [{ value: root, name: '.', short: '.', group: null }]

  for (const group of groups) {
    items.push(new Separator(''))
    items.push(new Separator(pc.bold(pc.cyan(group.name))))
    items.push({ value: group.path, name: '.', short: `${group.name}/.`, group: group.name })
    for (const repo of group.repos) {
      items.push({
        value: repo.path,
        name: repo.name,
        short: `${group.name}/${repo.name}`,
        group: group.name,
      })
    }
  }

  return items
}

function buildSearchItems(query: string, root: string, groups: OwnerGroup[]): ListItem[] {
  const q = query.trim().toLowerCase()
  const items: ListItem[] = []

  if (q === '.') {
    items.push({ value: root, name: '.', short: '.', group: null })
  }

  const repoMatches: LocationChoice[] = []
  for (const group of groups) {
    for (const repo of group.repos) {
      if (repo.name.toLowerCase().includes(q)) {
        repoMatches.push({
          value: repo.path,
          name: `${repo.name} ${pc.dim(`(${group.name})`)}`,
          short: `${group.name}/${repo.name}`,
          group: null,
        })
      }
    }
  }
  items.push(...repoMatches)

  const ownerMatches = groups.filter((g) => g.name.toLowerCase().includes(q))
  if (ownerMatches.length > 0) {
    if (items.length > 0) items.push(new Separator(''))
    for (const g of ownerMatches) {
      items.push({
        value: g.path,
        name: pc.dim(g.name),
        short: g.name,
        group: null,
      })
    }
  }

  return items
}

// ---- Prompt ----

const PAGE_SIZE = 10

const locationPrompt = createPrompt<
  string,
  { root: string; message: string; groups: OwnerGroup[] }
>((config, done) => {
  const { root, groups } = config
  const theme = makeTheme({})
  const prefix = usePrefix({ status: 'idle', theme })

  const [searchTerm, setSearchTerm] = useState('')

  const items = useMemo<ListItem[]>(
    () =>
      searchTerm ? buildSearchItems(searchTerm, root, groups) : buildBrowseItems(root, groups),
    [searchTerm],
  )

  const bounds = useMemo(() => {
    const first = items.findIndex(isSelectable)
    const last = items.findLastIndex(isSelectable)
    return { first, last }
  }, [items])

  const [active, setActive] = useState<number | undefined>(undefined)
  const safeActive = active ?? bounds.first

  useKeypress((key, rl) => {
    if (isEnterKey(key)) {
      const selected = items[safeActive]
      if (selected && isSelectable(selected)) {
        done(selected.value)
      } else {
        rl.write(searchTerm)
      }
    } else if (isUpKey(key) || isDownKey(key)) {
      rl.clearLine(0)
      if (
        (isUpKey(key) && safeActive !== bounds.first) ||
        (isDownKey(key) && safeActive !== bounds.last)
      ) {
        const offset = isUpKey(key) ? -1 : 1
        let next = safeActive
        do {
          next = (next + offset + items.length) % items.length
        } while (!isSelectable(items[next]))
        setActive(next)
      }
    } else {
      setActive(undefined)
      setSearchTerm(rl.line)
    }
  })

  const page = usePagination({
    items,
    active: safeActive,
    pageSize: PAGE_SIZE,
    loop: false,
    renderItem({ item, isActive }) {
      if (Separator.isSeparator(item)) {
        return ` ${item.separator}`
      }
      const cursor = isActive ? pc.cyan(figures.pointer) : ' '
      const text = isActive ? theme.style.highlight(item.name) : item.name
      return `${cursor} ${text}`
    },
  })

  // Sticky header: pin the active item's owner group label above the scrollable page
  let stickyHeader = ''
  if (!searchTerm) {
    const activeItem = items[safeActive]
    if (activeItem && isSelectable(activeItem) && activeItem.group) {
      stickyHeader = `  ${pc.bold(pc.cyan(activeItem.group))}\n`
    }
  }

  const searchStr = pc.cyan(searchTerm)
  const header = [prefix, config.message, searchStr].filter(Boolean).join(' ').trimEnd()
  const body = `${stickyHeader}${page}`

  return [header, body]
})

export async function promptLocationPath(root: string): Promise<string> {
  const groups = collectOwnerGroups(root)
  return locationPrompt({ root, message: 'Where would you like to go?', groups }).catch(
    (err: unknown) => {
      if (err instanceof Error && err.name === 'ExitPromptError') {
        error('Operation canceled.', 78)
      }
      throw err
    },
  )
}
