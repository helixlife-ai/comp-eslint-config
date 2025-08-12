// @ts-check
import { defineESLintConfig } from './src/factory'

export default defineESLintConfig({
  react: 'next',
  prettier: false,
  formatting: {
    semi: false,
  },
}, {
  rules: {
    'unicorn/prefer-single-call': 'off',
    'no-console': 'off',
  },
})
