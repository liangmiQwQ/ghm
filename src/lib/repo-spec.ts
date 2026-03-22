import { GhmError } from './error.js'

export type RepoSpec = {
  owner: string
  repo: string
}

export function parseRepoSpec(spec: string): RepoSpec {
  const trimmed = spec.trim()
  if (!trimmed) throw GhmError('Missing repo spec: <owner>/<repo>', 2)

  const parts = trimmed.split('/')
  if (parts.length !== 2) throw GhmError(`Invalid repo spec: ${spec}`, 2)

  const owner = parts[0]?.trim()
  const rawRepo = parts[1]?.trim()
  if (!owner || !rawRepo) throw GhmError(`Invalid repo spec: ${spec}`, 2)

  const repo = rawRepo.endsWith('.git') ? rawRepo.slice(0, -4) : rawRepo
  if (!repo) throw GhmError(`Invalid repo spec: ${spec}`, 2)

  return { owner, repo }
}
