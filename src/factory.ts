import commandConfig from 'eslint-plugin-command/config'

import {
  importConfig,
  javascriptConfigs,
  jsonConfigs,
  prettierConfig,
  reactConfigs,
  regexConfig,
  stylisticConfigs,
  tailwindCSSConfig,
  typeScriptConfigs,
  unicornConfigs,
  unusedConfig,
} from './configs'
import type { Options } from './option'
import { mergeDefaultOptions } from './option'
import type { ConfigArray } from './utils'
import { config } from './utils'

export async function defineESLintConfig(options?: Options, ...args: ConfigArray) {
  const finalOptions = await mergeDefaultOptions(options)

  return config(
    finalOptions,
    ...javascriptConfigs(finalOptions),
    ...unicornConfigs(finalOptions),
    ...typeScriptConfigs(finalOptions),
    importConfig(),
    unusedConfig(),
    regexConfig(),
    commandConfig(),
    ...stylisticConfigs(finalOptions),
    ...jsonConfigs(finalOptions),
    ...reactConfigs(finalOptions),
    prettierConfig(finalOptions),
    tailwindCSSConfig(finalOptions),
    ...args,
  )
}
