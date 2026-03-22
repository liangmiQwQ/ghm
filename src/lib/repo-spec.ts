export type RepoSpec = {
  owner: string
  repo: string
}

export function parseRepoSpec(spec: string): RepoSpec | string {
  const trimmed = spec.trim()
  if (!trimmed) return 'Missing repo spec: <owner>/<repo>'

  const parts = trimmed.split('/')
  if (parts.length !== 2) return `Invalid repo spec: ${spec}`

  const owner = parts[0]?.trim()
  const rawRepo = parts[1]?.trim()
  if (!owner || !rawRepo) return `Invalid repo spec: ${spec}`

  const repo = rawRepo.endsWith('.git') ? rawRepo.slice(0, -4) : rawRepo
  if (!repo) return `Invalid repo spec: ${spec}`

  return { owner, repo }
}
