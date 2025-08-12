import type { ESLint, Linter } from 'eslint'
import pluginPrettier from 'eslint-plugin-prettier'

import type { Options } from '../option'

export function prettierConfig({ prettier }: Required<Options>): Linter.Config {
  if (!prettier)
    return {}

  return {
    name: 'extent/prettier',
    plugins: {
      prettier: pluginPrettier as unknown as ESLint.Plugin,
    },
    rules: {
      ...pluginPrettier.rules,
      'prettier/prettier': 'warn',
    },
  }
}
