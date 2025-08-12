import defu from 'defu'
import type { Linter } from 'eslint'

import { GLOB_SRC } from './constants'
import type { Options } from './option'

type MaybeArray<T> = T | T[]
type Awaitable<T> = T | Promise<T>

type CreateFlatConfig = () => Awaitable<MaybeArray<Linter.Config> | undefined>

export type ConfigArray = Array<
  | undefined
  | null
  | false
  | MaybeArray<Awaitable<Linter.Config | undefined | null | false>>
  | CreateFlatConfig
>

export async function config(
  options: Required<Options>,
  ...configs: ConfigArray
) {
  const { ignoreFiles, ignores } = options

  const gitignore = await interopDefault(import('eslint-config-flat-gitignore'))

  const globalIgnores = defu(
    {
      ignores,
    },
    gitignore(
      {
        files: ignoreFiles,
        strict: false,
      },
    ),
  )

  return [
    globalIgnores,
    ...(
      await Promise.all(
        configs.map(async (config) => {
          if (typeof config === 'function') {
            const resolved = await config()

            if (!resolved)
              return

            return mergeConfigs(resolved)
          }

          if (!config)
            return

          return mergeConfigs(config)
        }).filter(index => !!index),
      )
    ),
  ]
}

export async function interopDefault<T>(
  m: Awaitable<T>,
): Promise<T extends { default: infer U } ? U : T> {
  const resolved = await m
  return (resolved as any).default || resolved
}

async function mergeConfigs(
  _c: MaybeArray<Awaitable<Linter.Config | undefined | null | false>>,
): Promise<Linter.Config | undefined> {
  const c = await _c

  if (!c)
    return

  if (Array.isArray(c))
    return withFiles(defu({}, ...c.toReversed()))

  return withFiles(c)
}

function withFiles(
  config: Linter.Config,
): Linter.Config {
  return defu<Linter.Config, Linter.Config[]>(
    config,
    'files' in config ? {} : { files: GLOB_SRC },
  )
}
