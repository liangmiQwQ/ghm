#!/usr/bin/env node
import prompts from '@posva/prompts'
import { cac } from 'cac'
import { cloneRepo } from './lib/clone.js'
import { readConfig } from './lib/config.js'
import { isGhmError } from './lib/error.js'
import { listRepos } from './lib/list.js'

const version = 'ghm'

function log(...args: unknown[]): void {
  console.log(...args)
}

function error(...args: unknown[]): void {
  console.error(...args)
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
      const { root } = await readConfig({ configPath: options.config })
      const repos = await listRepos(root)
      for (const repo of repos) log(repo)
    })

  cli
    .command('clone [spec]', 'Clone repo into <root>/<owner>/<repo>')
    .alias('c')
    .action(async (spec: string | undefined, options: { config?: string }) => {
      let resolvedSpec = spec
      if (!resolvedSpec) {
        if (!process.stdin.isTTY) throw new Error('Usage: ghm clone <owner>/<repo>')

        const answers = await prompts(
          {
            type: 'text',
            name: 'spec',
            message: 'Repository (owner/repo):',
            initial: 'vitejs/vite',
          },
          {
            onCancel: () => {
              process.exit(130)
            },
          },
        )

        resolvedSpec = answers.spec as string | undefined
        if (!resolvedSpec) throw new Error('Usage: ghm clone <owner>/<repo>')
      }

      const { root } = await readConfig({ configPath: options.config })
      await cloneRepo(resolvedSpec, { root })
    })

  cli.parse(['node', 'ghm', ...argv], { run: false })

  if (cli.args.length > 0) {
    error(`Unknown command: ${cli.args.join(' ')}`)
    return 2
  }

  try {
    await cli.runMatchedCommand()
    return 0
  } catch (err) {
    error((err as Error).message)
    return isGhmError(err) ? err.exitCode : 1
  }
}

main()
  .then((code) => {
    process.exitCode = code
  })
  .catch((err: unknown) => {
    error((err as Error).message)
    process.exitCode = 1
  })
