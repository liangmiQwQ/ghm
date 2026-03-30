import { existsSync } from 'node:fs'
import { cac } from 'cac'
import { version } from '../package.json'
import { getDefaultConfigPath, loadConfig } from './utils/config'
import { runCloneCommand } from './commands/clone'
import { runListCommand } from './commands/list'
import { promptRunSetupOnMissingConfig, runSetupCommand } from './commands/setup'
import { generateShellIntegration } from './commands/shell'
import { error } from './utils/error'
import { syncManagedShellrc } from './utils/shellrc'
import type { GlobalUserConfig } from './utils/config'
import { innerBinName, preventRunning, userBinName } from './utils/runner'

const cli = cac(userBinName)

await preventRunning()

type GlobalOptions = { config?: string }
type CommandActionArgs = unknown[]

function withConfig<T extends any[]>(
  handler: (config: GlobalUserConfig, ...args: T) => Promise<void> | void,
) {
  return async (...args: T): Promise<void> => {
    const options = args[args.length - 1] as GlobalOptions
    const configPath = options.config ? options.config : getDefaultConfigPath()

    if (!options.config && !existsSync(configPath)) {
      await promptRunSetupOnMissingConfig(() =>
        runSetupCommand({
          configPath,
          binName: innerBinName,
        }),
      )
      return
    }

    const config = loadConfig(options.config)
    await syncShellrcForRun(config)
    return handler(config, ...args)
  }
}

cli.option('-c, --config <path>', 'Use a custom config file path')

cli
  .command('setup', 'Setup config and shell integration for ghm')
  .action(async (...args: CommandActionArgs) => {
    const options = getGlobalOptions(args)
    await runSetupCommand({
      configPath: options.config,
      binName: innerBinName,
    })
  })

cli
  .command('clone <repo>', 'Clone a repository to <root>/<owner>/<repo>')
  .alias('c')
  .action(withConfig(async (config, repo: string) => await runCloneCommand(repo, config)))

cli
  .command('list', 'List repositories under configured root')
  .alias('ls')
  .action(withConfig(async (config) => await runListCommand(config)))

cli
  .command('shell <shell>', 'Generate shell integration code')
  .action(
    withConfig((config, shell: string) =>
      console.log(generateShellIntegration(shell, innerBinName, config)),
    ),
  )

cli.help()
cli.version(version || '0.0.0')

try {
  cli.parse()
} catch (err) {
  const message = err instanceof Error ? err.message : String(err)
  error(message.charAt(0).toUpperCase() + message.slice(1))
}

async function syncShellrcForRun(config: ReturnType<typeof loadConfig>): Promise<void> {
  try {
    await syncManagedShellrc(config.shells, innerBinName)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    error(`Failed to sync shellrc: ${message}`)
  }
}

function getGlobalOptions(args: CommandActionArgs): GlobalOptions {
  const maybeOptions = args[args.length - 1]
  return (maybeOptions && typeof maybeOptions === 'object' ? maybeOptions : {}) as GlobalOptions
}
