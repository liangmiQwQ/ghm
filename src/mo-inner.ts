import { existsSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { cac } from 'cac'
import { generateShellIntegration } from './inner/shell'
import { innerBinName } from './utils/runner'

const cli = cac(innerBinName)

cli
  .command('shell <shell>', 'Generate shell integration code')
  .action((shell: string) => console.log(generateShellIntegration(shell)))

cli.command('cd', 'Print pending directory path from shell state').action(() => {
  const targetFile = path.join(tmpdir(), 'mo-cd-target')
  if (!existsSync(targetFile)) {
    console.log('.')
    return
  }

  const pending = readFileSync(targetFile, 'utf8').trim()
  rmSync(targetFile)

  if (!pending) {
    console.log('.')
    return
  }

  console.log(pending)
})

cli.parse()
