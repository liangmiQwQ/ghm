import { existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import pc from 'picocolors'
import type { GlobalUserConfig } from '../config/config'
import { error } from '../output/error'
import { success, muted, highlight, startSpinner, stopSpinner } from '../output/format'

export async function runCloneCommand(repo: string, config: GlobalUserConfig): Promise<void> {
  const parsedRepo = parseRepo(repo)
  const ownerDir = path.join(config.root, parsedRepo.owner)
  const targetDir = path.join(ownerDir, parsedRepo.name)

  if (existsSync(targetDir)) {
    error(`Repository already exists at ${highlight(targetDir)}`)
  }

  mkdirSync(ownerDir, { recursive: true })

  const cloneUrl = `https://github.com/${parsedRepo.owner}/${parsedRepo.name}.git`
  const spinner = startSpinner(`Cloning ${pc.bold(`${parsedRepo.owner}/${parsedRepo.name}`)}...`)

  try {
    await runGitClone(cloneUrl, targetDir)
    stopSpinner(spinner)
    success(`Cloned ${pc.bold(`${parsedRepo.owner}/${parsedRepo.name}`)}`)
    console.log(`  ${muted('→')} ${highlight(targetDir)}`)
  } catch (err) {
    stopSpinner(spinner)
    if (err instanceof Error) {
      error(`Git clone failed for ${parsedRepo.owner}/${parsedRepo.name}: ${err.message}`)
    } else {
      error(`Git clone failed for ${parsedRepo.owner}/${parsedRepo.name}`)
    }
  }
}

function runGitClone(url: string, targetDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['clone', '--progress', url, targetDir], {
      env: process.env,
      shell: true,
    })

    let stderr = ''

    child.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        const error = new Error(stderr || `Git clone exited with code ${code}`)
        reject(error)
      }
    })

    child.on('error', (err) => {
      reject(err)
    })
  })
}

function parseRepo(repo: string): { owner: string; name: string } {
  const match = repo.match(/^([^/]+)\/([^/]+)$/)

  if (!match) {
    error('Invalid repository format. Use <owner>/<repo>.')
  }

  return {
    owner: match[1],
    name: match[2],
  }
}
