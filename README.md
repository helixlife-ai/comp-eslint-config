# @helix/eslint-config

一套面向 ESLint Flat Config（ESLint v9+）的可插拔规则预设，开箱即用，覆盖 TypeScript/JavaScript、React、JSON/Package JSON、正则、导入排序、未使用导入、Unicorn、Tailwind CSS、Stylistic/Prettier 等场景，并提供智能自动探测（React 框架、Tailwind CSS）。

> 适用于 ESM/TS `eslint.config.ts`。本文示例均为 TypeScript 导入写法（不带 `.js` 扩展名）。

---

## 特性

- **Flat Config**: 基于 ESLint v9 扁平化配置
- **自动探测**: 根据项目依赖自动启用 React（Vite/Next/Remix/Expo）与 Tailwind CSS 相关规则
- **TypeScript 支持**: 可选类型检查模式（`true` 或 `"essential"`）
- **两种风格模式**:
  - Stylistic（规则主导，内置可定制缩进/引号/分号/运算符换行等）
  - Prettier（由 Prettier 接管格式化，规避冲突）
- **常用增强**: 
  - 导入顺序与分组（`simple-import-sort`/`import-x`）
  - 未使用导入/变量快速清理（`eslint-plugin-unused-imports`）
  - 正则最佳实践（`eslint-plugin-regexp`）
  - JSON/JSONC/JSON5 与 `package.json` 规则
  - Unicorn、Antfu、Hyoban 等实用规则
- **合理忽略**: 自动合并 `.gitignore`，并追加常见产物与锁文件忽略

---

## 安装

需要 ESLint v9+ 与 TypeScript（仅在 TS 项目中）：

```bash
# pnpm（推荐）
pnpm add -D @helix/eslint-config eslint typescript

# npm
npm i -D @helix/eslint-config eslint typescript

# yarn
yarn add -D @helix/eslint-config eslint typescript
```

如果你的项目使用 React 或 Tailwind CSS，只需在项目内正常安装它们，本配置会自动识别并启用相应规则。

---

## 快速开始

在项目根目录创建 `eslint.config.ts`：

```ts
import { defineESLintConfig } from '@helix/eslint-config'

export default defineESLintConfig()
```

推荐在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

运行：

```bash
pnpm lint
pnpm lint:fix
```

如需可视化调试配置：

```bash
npx @eslint/config-inspector@latest
```

---

## 选项 Options

`defineESLintConfig(options?: Options, ...extraConfigs)` 支持以下关键选项（仅列主干，完整类型见源码 `src/option.ts`）：

- **react**: `'vite' | 'next' | 'remix' | 'expo' | boolean`（默认自动探测）
  - 启用 React 生态规则，并根据框架调整 `react-refresh/only-export-components` 白名单
- **tailwindCSS**: `boolean | { order: boolean }`（默认自动探测）
  - 启用 `eslint-plugin-tailwindcss` 推荐规则；当 `{ order: false }` 时关闭类名排序规则
- **typeChecked**: `boolean | 'essential'`（默认 `false`）
  - 启用 TypeScript 类型感知规则；`'essential'` 只开启关键异步安全规则
- **project / projectService / tsconfigRootDir**
  - 在 `typeChecked: true` 时设置 TS 项目范围（例如 `project: ['./tsconfig.json']`）
- **strict**: `boolean`（默认 `false`）
  - 使用更严格的 `@eslint/js` 与 `typescript-eslint` 预设，并微调不适配的规则
- **formatting**: `false | { indent, quotes, semi, lineBreak }`（默认启用 Stylistic 基础格式）
  - 当 `prettier: true` 时将自动忽略此项，由 Prettier 接管格式
- **prettier**: `boolean`（默认 `false`）
  - 使用 `eslint-plugin-prettier` 融合 Prettier，避免与规则冲突
- **lessOpinionated**: `boolean`（默认 `false`）
  - 放宽部分有主观看法的规则
- **fileCase**: `'camelCase' | 'kebabCase' | 'pascalCase' | 'snakeCase' | false`
  - 控制 `unicorn/filename-case`
- **preferESM**: `boolean`（默认 `false`）
  - 关闭后会放开某些 CommonJS 导入限制
- **ignores / ignoreFiles**
  - 追加忽略条目或忽略文件来源（默认合并 `.gitignore` 和常见产物）
- 还包括：`restrictedSyntax`, `filesDisableTypeChecking`, `linterOptions`, `settings` 等

---

## 示例

- 最简（自动探测 React/Tailwind）

```ts
import { defineESLintConfig } from '@helix/eslint-config'

export default defineESLintConfig()
```

- Next.js + Tailwind + Prettier 模式

```ts
import { defineESLintConfig } from '@helix/eslint-config'

export default defineESLintConfig({
  react: 'next',
  tailwindCSS: true,
  prettier: true,
})
```

- React + Vite，类型检查（严格）

```ts
import { defineESLintConfig } from '@helix/eslint-config'

export default defineESLintConfig({
  react: 'vite',
  typeChecked: true,
  project: ['./tsconfig.json'],
  strict: true,
})
```

- 仅 Node.js/TS，使用 Stylistic 并自定义格式

```ts
import { defineESLintConfig } from '@helix/eslint-config'

export default defineESLintConfig({
  react: false,
  formatting: {
    indent: 2,
    quotes: 'single',
    semi: false,
    lineBreak: 'before',
  },
  fileCase: 'kebabCase',
})
```

- Tailwind 类名排序关闭（常见于与工具链排序冲突时）

```ts
import { defineESLintConfig } from '@helix/eslint-config'

export default defineESLintConfig({
  tailwindCSS: { order: false },
})
```

---

## 内置能力概览

- JavaScript：基于 `@eslint/js` 推荐（或严格）配置
- TypeScript：基于 `typescript-eslint` base + recommended/strict + 自定义增强
- React：基于 `@eslint-react/eslint-plugin` 推荐/全量 + 官方 `react-hooks` + `react-refresh`
- 导入：`simple-import-sort`、`import-x`、`antfu` 去重与约束
- 未使用导入/变量：`eslint-plugin-unused-imports`
- 正则：`eslint-plugin-regexp`
- JSON/JSONC/JSON5：`eslint-plugin-jsonc` + `jsonc-eslint-parser`
- package.json：`eslint-plugin-package-json`
- Unicorn：`eslint-plugin-unicorn` 推荐 + 实用规则微调
- Stylistic：`@stylistic/eslint-plugin` 可定制格式化；或切换到 Prettier 模式

---

## 常见问题（FAQ）

- 与 Prettier 冲突？
  - 设定 `prettier: true` 可由 `eslint-plugin-prettier` 接管格式化，同时关闭冲突的 Stylistic 规则。
- 我需要手动安装所有插件吗？
  - 无需。本包已内置相关依赖；仅需满足 `peerDependencies`：`eslint` 与（在 TS 项目中）`typescript`。
- 如何只在部分文件开启类型检查？
  - 使用 `typeChecked: 'essential'` 以低成本保证关键异步安全；或在 `typeChecked: true` 下配合 `filesDisableTypeChecking` 定向排除。
- React 规则中的 `react-refresh/only-export-components` 提示太严格？
  - 依据 `react` 选项自动放行框架允许的导出（如 Next 的 `generateMetadata` 等）。如仍不适配，可在项目覆盖相应规则。

---

## 许可

MIT © Bobby
