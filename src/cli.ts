#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

interface CliOptions {
  prettier?: boolean
  react?: 'vite' | 'next' | 'remix' | 'expo' | boolean
  tailwindCSS?: boolean
  typeChecked?: boolean | 'essential'
  strict?: boolean
  file?: 'ts' | 'js'
  yes?: boolean
  force?: boolean
  install?: boolean
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { install: true }
  for (const arg of argv) {
    if (arg === '--prettier') {
      options.prettier = true
    }
    else if (arg === '--no-prettier') {
      options.prettier = false
    }
    else if (arg.startsWith('--react=')) {
      const v = arg.split('=')[1]
      if (v === 'true' || v === 'false')
        options.react = v === 'true'
      else if (v === 'vite' || v === 'next' || v === 'remix' || v === 'expo')
        options.react = v
    }
    else {
      switch (arg) {
        case '--react': {
          options.react = true
          break
        }
        case '--no-react': {
          options.react = false
          break
        }
        case '--tailwind':
        case '--tailwindCSS': {
          options.tailwindCSS = true
          break
        }
        case '--no-tailwind':
        case '--no-tailwindCSS': {
          options.tailwindCSS = false
          break
        }
        case '--typechecked':
        case '--typeChecked': {
          options.typeChecked = true
          break
        }
        default: { if (arg.startsWith('--typechecked=')) {
          const v = arg.split('=')[1]
          switch (v) {
            case 'true': {
              options.typeChecked = true
              break
            }
            case 'false': {
              options.typeChecked = false
              break
            }
            case 'essential': { {
              options.typeChecked = 'essential'
              // No default
            }
            break
            }
          }
        }
        else {
          switch (arg) {
            case '--strict': {
              options.strict = true
              break
            }
            case '--no-strict': {
              options.strict = false
              break
            }
            case '--js': {
              options.file = 'js'
              break
            }
            case '--ts': {
              options.file = 'ts'
              break
            }
            default: { if (arg.startsWith('--file=')) {
              const v = arg.split('=')[1]
              if (v === 'js' || v === 'ts')
                options.file = v
            }
            else {
              switch (arg) {
                case '--yes':
                case '-y': {
                  options.yes = true
                  break
                }
                case '--force':
                case '-f': {
                  options.force = true
                  break
                }
                case '--no-install': { {
                  options.install = false
                  // No default
                }
                break
                }
              }
            }
            }
          }
        }
        }
      }
    }
  }
  return options
}

function detectPackageManager(cwd: string): 'pnpm' | 'bun' | 'yarn' | 'npm' {
  const ua = process.env.npm_config_user_agent || ''
  if (ua.startsWith('pnpm'))
    return 'pnpm'
  if (ua.startsWith('yarn'))
    return 'yarn'
  if (ua.startsWith('bun'))
    return 'bun'
  if (ua.startsWith('npm'))
    return 'npm'
  if (existsSync(join(cwd, 'pnpm-lock.yaml')))
    return 'pnpm'
  if (existsSync(join(cwd, 'bun.lockb')))
    return 'bun'
  if (existsSync(join(cwd, 'yarn.lock')))
    return 'yarn'
  if (existsSync(join(cwd, 'package-lock.json')))
    return 'npm'
  return 'pnpm'
}

function run(cmd: string, args: string[], cwd: string) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', cwd, shell: false })
  if (result.status !== 0) {
    console.error(`Command failed: ${cmd} ${args.join(' ')}`)
    process.exit(result.status == null ? 1 : result.status)
  }
}

function ensureInstalled(cwd: string, pm: ReturnType<typeof detectPackageManager>) {
  const deps = ['@helix/eslint-config', 'eslint', 'typescript']
  const addArgsByPM: Record<typeof pm, string[]> = {
    pnpm: ['add', '-D', ...deps],
    npm: ['i', '-D', ...deps],
    yarn: ['add', '-D', ...deps],
    bun: ['add', '-d', ...deps],
  }
  run(pm, addArgsByPM[pm], cwd)
}

function readJSON(file: string): any | null {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  }
  catch {
    return null
  }
}

function writeJSON(file: string, data: any) {
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function updatePackageJsonScripts(cwd: string) {
  const pkgPath = join(cwd, 'package.json')
  const pkg = readJSON(pkgPath)
  if (!pkg)
    return
  pkg.scripts ||= {}
  if (!pkg.scripts.lint)
    pkg.scripts.lint = 'eslint .'
  if (!pkg.scripts['lint:fix'])
    pkg.scripts['lint:fix'] = 'eslint . --fix'
  writeJSON(pkgPath, pkg)
}

function generateConfigContent(options: CliOptions): string {
  const lines: string[] = []
  lines.push(`import { defineESLintConfig } from '@helix/eslint-config'`)
  const entries: string[] = []
  if (options.react !== undefined) {
    if (typeof options.react === 'boolean')
      entries.push(`react: ${options.react}`)
    else entries.push(`react: '${options.react}'`)
  }
  if (options.tailwindCSS !== undefined)
    entries.push(`tailwindCSS: ${options.tailwindCSS}`)
  if (options.prettier !== undefined)
    entries.push(`prettier: ${options.prettier}`)
  if (options.strict !== undefined)
    entries.push(`strict: ${options.strict}`)
  if (options.typeChecked !== undefined) {
    if (options.typeChecked === 'essential')
      entries.push(`typeChecked: 'essential'`)
    else entries.push(`typeChecked: ${options.typeChecked}`)
  }

  if (entries.length === 0) {
    lines.push('', 'export default defineESLintConfig()')
  }
  else {
    lines.push('', 'export default defineESLintConfig({')
    lines.push(`  ${entries.join(',\n  ')}`, '})')
  }

  return `${lines.join('\n')}\n`
}

function ensureConfigFile(cwd: string, options: CliOptions) {
  const ext = options.file ?? 'ts'
  const filename = `eslint.config.${ext}`
  const full = join(cwd, filename)
  if (existsSync(full) && !options.force) {
    console.log(`${filename} already exists. Use --force to overwrite.`)
    return
  }
  const content = generateConfigContent(options)
  writeFileSync(full, content, 'utf8')
  console.log(`Wrote ${filename}`)
}

function printHelp() {
  const help = `\nUsage: npx @helix/eslint-config [options]\n\nOptions:\n  --prettier              Enable Prettier integration\n  --react[=next|vite|remix|expo|true|false]  Configure React framework or toggle\n  --tailwind / --no-tailwind  Toggle Tailwind CSS rules\n  --typechecked[=true|false|essential]  Enable TS type-aware rules\n  --strict                Enable stricter presets\n  --ts / --js / --file=ts|js  Choose config file extension (default: ts)\n  --force, -f            Overwrite existing eslint.config.*\n  --no-install           Do not install dependencies\n  --yes, -y              Assume yes for non-interactive flow\n  -h, --help             Show this help\n`
  console.log(help)
}

function main() {
  const args = process.argv.slice(2)
  if (args.includes('-h') || args.includes('--help')) {
    printHelp()
    return
  }
  const cwd = resolve(process.cwd())
  const options = parseArgs(args)

  const pm = detectPackageManager(cwd)
  if (options.install !== false)
    ensureInstalled(cwd, pm)

  ensureConfigFile(cwd, options)
  updatePackageJsonScripts(cwd)

  console.log('\n✅ @helix/eslint-config is set up!')
  console.log('Run:')
  console.log('  - pnpm lint        # or npm run lint / yarn lint / bun run lint')
  console.log('  - pnpm lint:fix    # or npm run lint:fix / yarn lint:fix / bun run lint:fix')
}

main()
