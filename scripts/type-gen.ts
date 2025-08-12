import fs from 'node:fs/promises'

import { builtinRules } from 'eslint/use-at-your-own-risk'
import { flatConfigsToPlugins, pluginsToRulesDTS } from 'eslint-typegen/core'

import { defineESLintConfig } from '../src'

const configs = await defineESLintConfig({
  react: 'next',
  strict: true,
  typeChecked: true,
  tailwindCSS: true,
})

const plugins = await flatConfigsToPlugins(
  [
    {
      plugins: {
        '': {
          rules: Object.fromEntries(builtinRules.entries()),
        },
      },
    },
    ...configs.filter(Boolean),
  ],
)

const dts = await pluginsToRulesDTS(plugins)

await fs.writeFile('eslint-typegen.d.ts', dts)
