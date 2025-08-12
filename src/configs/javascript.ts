import js from '@eslint/js'
import type { Linter } from 'eslint'
import globals from 'globals'

import { GLOB_SRC } from '../constants'
import type { Options } from '../option'

export function javascriptConfigs({
  linterOptions,
  settings,
  strict,
  restrictedSyntax,
}: Required<Options>): [Linter.Config, Linter.Config[]] {
  return [
    {
      files: GLOB_SRC,
      languageOptions: {
        ecmaVersion: 2022,
        globals: {
          ...globals.node,
          ...globals.browser,
          ...globals.es2022,
        },
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
          },
          ecmaVersion: 2022,
          sourceType: 'module',
        },
        sourceType: 'module',
      },
      linterOptions,
      settings,
      name: strict ? '@eslint/js/all' : '@eslint/js/recommended',
      rules: strict ? js.configs.all.rules : js.configs.recommended.rules,
    },
    [
      strict
        ? {
            rules: {
              'arrow-body-style': 'off',
              'curly': 'off',
              'func-style': 'off',
              'no-empty-function': 'off',
              'object-shorthand': 'off',
              'prefer-destructuring': 'off',
              'prefer-template': 'off',
            },
          }
        : {},
      strict
        ? {
            rules: {
              'camelcase': 'off',
              'capitalized-comments': 'off',
              'complexity': 'off',
              'consistent-return': 'off',
              'id-length': 'off',
              'max-lines-per-function': 'off',
              'max-lines': 'off',
              'max-statements': 'off',
              'no-implicit-coercion': 'off',
              'no-inline-comments': 'off',
              'no-magic-numbers': 'off',
              'no-warning-comments': 'off',
            },
          }
        : {},
      strict
        ? {
            rules: {
              'init-declarations': 'off',
              'no-continue': 'off',
              'no-shadow': 'off',
              'no-ternary': 'off',
              'no-undefined': 'off',
              'no-underscore-dangle': 'off',
              'no-useless-assignment': 'off',
              'one-var': 'off',
              'prefer-named-capture-group': 'off',
              'require-unicode-regexp': 'off',
              'sort-keys': 'off',
              'sort-vars': 'off',
            },
          }
        : {},
      strict
        ? {
            rules: {
              'no-void': ['error', { allowAsStatement: true }],
            },
          }
        : {},
      {
        name: '@eslint/js/custom',
        /// keep-sorted
        rules: {
          // https://twitter.com/karlhorky/status/1773632485055680875
          'array-callback-return': 'error',
          'eqeqeq': ['error', 'smart'],
          'new-cap': ['error', { capIsNew: false, newIsCap: true, properties: true }],
          'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
          // https://twitter.com/ryanflorence/status/1786394911895683512
          'no-param-reassign': 'warn',
          'no-restricted-syntax': ['error', ...restrictedSyntax],
          'no-template-curly-in-string': 'error',
          'no-use-before-define': ['error', { classes: false, functions: false, variables: true }],
          'prefer-arrow-callback': ['error', { allowNamedFunctions: true, allowUnboundThis: true }],
        },
      },
    ],
  ]
}
