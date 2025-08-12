import type { StylisticCustomizeOptions } from '@stylistic/eslint-plugin'
import type { ParserOptions } from '@typescript-eslint/types'
import defu from 'defu'
import type { Linter } from 'eslint'
import { isPackageExists } from 'local-pkg'

import { DEFAULT_IGNORE_FILES, GLOB_EXCLUDE } from './constants'

export type Options = {
  ignores?: string[]
  ignoreFiles?: string[]

  strict?: boolean
  restrictedSyntax?: Array<string | { selector: string, message?: string }>
  react?: 'vite' | 'next' | 'remix' | 'expo' | boolean
  tailwindCSS?: boolean | {
    order: boolean
  }
  typeChecked?: boolean | 'essential'
  tsconfigRootDir?: string
  project?: ParserOptions['project']
  projectService?: ParserOptions['projectService']
  preferESM?: boolean
  filesDisableTypeChecking?: string[]
  formatting?: false | Omit<StylisticCustomizeOptions, 'flat' | 'pluginName'> & {
    lineBreak?: 'after' | 'before'
  }
  lessOpinionated?: boolean
  fileCase?: 'camelCase' | 'kebabCase' | 'pascalCase' | 'snakeCase' | false
  prettier?: boolean
} & Pick<Linter.Config, 'linterOptions' | 'settings'>

export async function mergeDefaultOptions(options?: Options) {
  const hasVite = isPackageExists('vite')

  const hasNext = isPackageExists('next')
  const hasRemix = isPackageExists('remix')
  const hasExpo = isPackageExists('expo')
  const hasReact = isPackageExists('react')

  const hasTailwindCSS = isPackageExists('tailwindcss')

  const defaultOptions: Required<Options> = {
    ignores: GLOB_EXCLUDE,
    ignoreFiles: DEFAULT_IGNORE_FILES,
    react: hasNext ? 'next' : hasRemix ? 'remix' : hasExpo ? 'expo' : (hasVite && hasReact) ? 'vite' : hasReact,
    tailwindCSS: hasTailwindCSS,
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    settings: {
      ...(
        hasTailwindCSS
          ? {
              tailwindcss: {
                callees: ['classnames', 'clsx', 'ctl', 'cn'],
              },
            }
          : {}
      ),
    },
    strict: false,
    restrictedSyntax: [
      'DebuggerStatement',
      'LabeledStatement',
      'WithStatement',
      // https://www.typescriptlang.org/docs/handbook/enums.html#const-enums
      // https://youtu.be/XTXPKbPcvl4?si=J_2E9dM25sAEXM2x
      'TSEnumDeclaration[const=true]',
      'TSExportAssignment',
    ],
    typeChecked: false,
    project: !!options?.typeChecked,
    projectService: false,
    tsconfigRootDir: process.cwd(),
    preferESM: false,
    filesDisableTypeChecking: [],
    formatting: {
      indent: 2,
      quotes: 'single',
      semi: false,
    },
    lessOpinionated: false,
    fileCase: false,
    prettier: false,
  }

  return defu<Required<Options>, Options[]>(options, defaultOptions)
}
