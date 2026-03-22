#!/usr/bin/env node
import { pathToFileURL } from 'node:url'
import prompts from '@posva/prompts'
import { cac } from 'cac'
import { cloneRepo } from './lib/clone.js'
import { readConfig } from './lib/config.js'
import { listRepos } from './lib/list.js'
import { error } from './lib/output.js'
import { parseRepoSpec } from './lib/repo-spec.js'

const version = 'ghm'

function log(...args: unknown[]): void {
  console.log(...args)
}

function parseGitExitCode(message: string): number | undefined {
  if (message === 'git not found in PATH') return 127

  const match = message.match(/^git clone failed \(exit (\d+)\)$/)
  if (!match) return undefined

  const code = Number(match[1])
  return Number.isFinite(code) ? code : undefined
}

export async function main(argv = process.argv.slice(2)): Promise<number> {
  const cli = cac('ghm')

  cli.option('--config <path>', 'Config file path (default: ~/.config/ghm.json)')
  cli.help()
  cli.version(version)

  cli
    .command('list', 'List repos under <root>')
    .alias('ls')
    .action(async (options: { config?: string }) => {
      const config = await readConfig({ configPath: options.config })
      if (typeof config === 'string') return error(config, 2)

      const { root } = config
      const repos = await listRepos(root)
      for (const repo of repos) log(repo)
    })

  cli
    .command('clone [spec]', 'Clone repo into <root>/<owner>/<repo>')
    .alias('c')
    .action(async (spec: string | undefined, options: { config?: string }) => {
      let resolvedSpec = spec
      if (!resolvedSpec) {
        if (!process.stdin.isTTY) return error('Usage: ghm clone <owner>/<repo>', 2)

        const answers = await prompts(
          {
            type: 'text',
            name: 'spec',
            message: 'Repository (owner/repo):',
            initial: 'vitejs/vite',
          },
          {
            onCancel: () => {
              error('Cancelled', 130)
            },
          },
        )

        resolvedSpec = answers.spec as string | undefined
        if (!resolvedSpec) return error('Usage: ghm clone <owner>/<repo>', 2)
      }

      const parsedSpec = parseRepoSpec(resolvedSpec)
      if (typeof parsedSpec === 'string') return error(parsedSpec, 2)

      const config = await readConfig({ configPath: options.config })
      if (typeof config === 'string') return error(config, 2)

      const result = await cloneRepo(resolvedSpec, { root: config.root })
      if (typeof result === 'string') return error(result, parseGitExitCode(result) ?? 2)
    })

  cli.parse(['node', 'ghm', ...argv], { run: false })

  if (cli.args.length > 0) {
    return error(`Unknown command: ${cli.args.join(' ')}`, 2)
  }

  try {
    await cli.runMatchedCommand()
    return 0
  } catch (err) {
    return error((err as Error).message, 1)
  }
}

const entryFile = process.argv[1]
if (entryFile && import.meta.url === pathToFileURL(entryFile).href) {
  void main()
    .then((code) => {
      process.exit(code)
    })
    .catch((err: unknown) => {
      error((err as Error).message, 1)
    })
}
