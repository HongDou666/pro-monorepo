# pro-monorepo

基于 pnpm workspace 的前端 monorepo，包含以下能力：

- Vue 3 主应用
- micro-app 微前端主子应用通信示例
- React 与 Vue 子应用
- 可独立发布的 utils、components 与共享配置包
- UnoCSS 原子化样式与统一设计 token
- Vitest 测试、ESLint、Stylelint、Prettier、CSpell 质量检查

## 技术栈

- Node.js 22+
- pnpm 10+
- Vite 8
- Vue 3 + TypeScript
- React 19 + TypeScript
- micro-app
- UnoCSS
- Vitest
- Rollup

## 目录结构

```text
.
├─ src/                          # 主应用（Vue）
├─ shared/micro-app/             # 主子应用共享通信协议
├─ apps/micro-app/
│  ├─ vite-vue/                  # Vue 子应用
│  └─ vite-react/                # React 子应用
├─ packages/
│  ├─ axios/                     # 公共请求库
│  ├─ utils/                     # 工具库
│  ├─ components/                # 组件库
│  ├─ eslint-config/             # 共享 ESLint flat config 包
│  ├─ stylelint-config/          # 共享 Stylelint 配置包
│  ├─ unocss-config/             # 共享 UnoCSS 配置包
│  └─ cli/                       # 预留目录，当前未实现
├─ scripts/                      # 构建、开发、提交流程脚本
├─ public/                       # 主应用静态资源
└─ dist/                         # 主应用构建产物
```

## 本地开发

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置微前端子应用地址

仓库根目录提供了示例环境变量文件 [.env.example](.env.example)。

常用配置如下：

```bash
VITE_MICRO_APP_VUE_URL=http://localhost:5174/
VITE_MICRO_APP_REACT_URL=http://localhost:5175/
```

默认值已经兼容本地开发端口；如果你把子应用部署到其他地址，直接覆盖这两个变量即可。

### 3. 启动主应用与子应用

主应用：

```bash
pnpm dev
```

Vue 子应用：

```bash
cd apps/micro-app/vite-vue
pnpm dev
```

React 子应用：

```bash
cd apps/micro-app/vite-react
pnpm dev
```

组件库监听构建：

```bash
pnpm dev:packages
```

建议联调顺序：

1. 先启动两个子应用。
2. 再启动主应用。
3. 打开主应用中的“微前端应用”页面验证通信。

## 常用命令

```bash
# 主应用开发
pnpm dev

# 构建 packages + 主应用
pnpm build:all

# 仅构建 packages
pnpm build:packages

# 运行测试
pnpm test

# 运行 ESLint
pnpm lint:eslint

# 自动修复 ESLint
pnpm lint:eslint:fix

# 运行 Stylelint
pnpm lint:stylelint

# 自动修复 Stylelint
pnpm lint:stylelint:fix

# 统一格式化
pnpm lint:prettier

# 拼写检查
pnpm lint:spellcheck
```

## Packages

### @pro-monorepo/utils

提供浏览器存储与加密相关工具：

- storage：localStorage / sessionStorage 读写、过期时间、带前缀实例
- crypto：Base64、XOR、AES-GCM、SHA-256、SHA-512、MD5

当前已导出以下核心类型，便于业务方直接复用：

- `StorageType`
- `StorageOptions`
- `StorageData<T>`
- `PrefixedStorage`

注意：

- XOR 与 MD5 只适用于演示、兼容或弱安全场景，不适合作为强安全方案。
- crypto 模块当前仍保留“失败时返回空字符串”的兼容行为；如果你要用于安全敏感数据，请在业务层显式校验返回值并补充失败处理。

### @pro-monorepo/axios

提供基于 axios 的统一请求封装，适用于主应用与微前端子应用复用：

- `createHttpClient`：创建独立请求实例
- 请求并发控制：限制同时发出的请求数量
- `cancelAllRequests`：取消当前实例下所有未完成请求
- 失败重试：支持重试次数、延迟与自定义重试条件
- 请求缓存：默认支持 GET/HEAD 请求的内存缓存

详细使用方式见 [packages/axios/README.md](packages/axios/README.md)。

### @pro-monorepo/components

当前包含两个组件：

- `ProInputStorage`
- `ProRangePicker`

组件依赖 Vue 3、Ant Design Vue、dayjs，并以 workspace package 的形式被主应用直接消费。

### @pro-monorepo/eslint-config

提供 monorepo 统一 ESLint flat config 构建函数：

- `createMonorepoEslintConfig`
- `createVueAppEslintConfig`
- `createReactAppEslintConfig`

根应用和子应用都通过该包消费共享规则，避免在多个 `eslint.config.js` 中重复维护。

### @pro-monorepo/stylelint-config

提供 monorepo 统一 Stylelint 配置。

根级 [stylelint.config.js](stylelint.config.js) 通过 `extends: ["@pro-monorepo/stylelint-config"]` 复用共享规则；后续如果子应用需要独立 Stylelint 入口，也应直接扩展该包。

### @pro-monorepo/unocss-config

提供 monorepo 统一 UnoCSS 配置工厂：

- 共享设计 token：颜色、阴影、圆角、字体、容器宽度
- 共享 shortcuts：`pro-panel`、`pro-shell-page`、`pro-title` 等基础布局语义类
- 共享 transformers：支持 variant group 与 `@apply`

根应用、Vue 子应用、React 子应用分别在各自的 [uno.config.ts](uno.config.ts)、[apps/micro-app/vite-vue/uno.config.ts](apps/micro-app/vite-vue/uno.config.ts)、[apps/micro-app/vite-react/uno.config.ts](apps/micro-app/vite-react/uno.config.ts) 中基于该包做轻量扩展。

## 共享配置维护约定

### 版本策略

- `@pro-monorepo/eslint-config` 与 `@pro-monorepo/stylelint-config` 视为基础设施包，应独立维护版本。
- `@pro-monorepo/unocss-config` 同样视为基础设施包，主题 token 或 shortcuts 的破坏性调整应按 breaking change 处理。
- 新增规则、调整默认规则、升级关键 lint 插件时，应同步更新对应包的 `CHANGELOG.md`。
- 如果规则变更可能导致现有代码新增报错，按 breaking change 处理，不要静默合并。

### 变更记录

- ESLint 共享配置变更记录位于 [packages/eslint-config/CHANGELOG.md](packages/eslint-config/CHANGELOG.md)。
- Stylelint 共享配置变更记录位于 [packages/stylelint-config/CHANGELOG.md](packages/stylelint-config/CHANGELOG.md)。
- UnoCSS 共享配置变更记录位于 [packages/unocss-config/CHANGELOG.md](packages/unocss-config/CHANGELOG.md)。
- Prettier 仓库级治理说明位于 [docs/prettier-governance.md](docs/prettier-governance.md)。

### 提交建议

- 修改共享配置时，优先使用 `eslint-config` 或 `stylelint-config` 作为 commit scope。
- 修改 UnoCSS 共享配置时，优先使用 `unocss-config` 作为 commit scope。
- 修改仓库级格式化约定时，优先使用 `prettier` 作为 commit scope。
- 同时影响根仓与子应用时，再使用 `root` 或更具体的业务 scope。

### Prettier 治理

- Prettier 的单一事实来源是 [prettier.config.js](prettier.config.js)、[.prettierignore](.prettierignore) 与 [.editorconfig](.editorconfig)。
- 新增应用或包时，默认继承根级 Prettier 约定，不单独创建本地 Prettier 配置。
- 调整格式化约定前，先阅读 [docs/prettier-governance.md](docs/prettier-governance.md) 中的职责边界与变更流程。

## 微前端通信约定

共享协议位于 [shared/micro-app/communication.ts](shared/micro-app/communication.ts)。

当前统一约定了：

- 子应用名称：`vite-vue`、`vite-react`
- 消息来源：`main` 或具体子应用名
- 消息类型：`main.greeting`、`sub.reply`
- 标准消息结构：`source`、`type`、`timestamp`、`traceId`、`payload`

主应用通过 micro-app 数据通道与子应用通信：

- 主应用使用 `microApp.setData(name, payload)` 下发消息
- 主应用使用 `addDataListener` 监听子应用回传消息
- 子应用应复用 shared 中的协议定义，避免各自硬编码消息字段

## 构建与发布

### 主应用构建

```bash
pnpm build
```

### 独立构建 workspace 包

```bash
pnpm build:packages
```

packages 构建基于 Rollup，入口脚本位于 [scripts/build.js](scripts/build.js) 与 [scripts/buildBase.js](scripts/buildBase.js)。

### 发布包

```bash
pnpm publish:utils
pnpm publish:components
```

注意：发布脚本当前使用了 `--no-git-checks`，这意味着它不会帮你拦截脏工作区、未测试变更或未提交文件。发布前至少手动执行一次：

```bash
pnpm lint:eslint
pnpm lint:stylelint
pnpm test
pnpm build:all
```

## 测试说明

- `packages/utils` 使用 jsdom 环境测试浏览器 API。
- `packages/components` 使用浏览器模式测试组件行为。
- CI 环境下浏览器测试会自动切换为 headless 模式，本地默认保留可视化浏览器，便于调试。

你也可以单独运行：

```bash
pnpm --filter @pro-monorepo/utils test
pnpm --filter @pro-monorepo/components test
```

## 代码规范与约束

| 工具            | 主要职责                                      | 解决的问题                                            | 不负责什么                     | 配置入口                                                                                                                                 |
| --------------- | --------------------------------------------- | ----------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `.editorconfig` | 统一编辑器基础文本行为                        | 缩进、换行、文件末尾空行、行尾空白等基础编辑体验      | 代码语义、格式化细节、语法规则 | [.editorconfig](.editorconfig)                                                                                                           |
| Prettier        | 统一代码与文档格式化输出                      | 引号、分号、换行宽度、对象/数组排版、Vue SFC 基础格式 | 代码质量校验、样式语义校验     | [prettier.config.js](prettier.config.js)、[.prettierignore](.prettierignore)、[docs/prettier-governance.md](docs/prettier-governance.md) |
| ESLint          | 统一 JS / TS / Vue / React 代码规范与质量约束 | 未使用变量、危险写法、框架最佳实践、导入与类型约束    | 纯样式文件语义、代码排版主导权 | [eslint.config.js](eslint.config.js)、[packages/eslint-config/src/index.js](packages/eslint-config/src/index.js)                         |
| Stylelint       | 统一 CSS / Less / Scss / Vue style 规范       | 非法样式规则、选择器与属性合法性、样式层约束          | JS / TS 语义、通用代码格式化   | [stylelint.config.js](stylelint.config.js)、[packages/stylelint-config/src/index.js](packages/stylelint-config/src/index.js)             |

- ESLint 负责 JavaScript / TypeScript / Vue / React 规范
- Stylelint 负责样式规范
- Prettier 负责格式化
- CSpell 负责英文拼写检查
- Commitizen + safe commit 脚本用于保护提交前的改动快照
- ESLint 与 Stylelint 规则已经沉淀到 workspace 配置包，Prettier 约定由根级治理文档统一维护，新增应用应优先复用现有治理层而不是复制配置文件

如果使用 `pnpm commit`，仓库会先为当前未提交改动创建备份，提交中断时可以通过 `pnpm commit:restore` 恢复。

## 本次已完成的工程优化

- 修复了多子项目工作区下 ESLint 的 `tsconfigRootDir` 解析问题
- 将主应用中的微前端子应用地址改为环境变量可配置
- 收敛了主应用内与 micro-app 相关的开发态日志输出
- 为子应用加载失败补充了用户可见提示
- 补齐了 `@pro-monorepo/utils` 的类型导出
- 修复了 `packages/utils` 与 `packages/components` 的测试脚本占位问题
- 将浏览器测试配置调整为在 CI 中自动使用 headless 模式
- 为 packages 构建脚本增加了更稳妥的节点属性判断
- 抽离了 `@pro-monorepo/eslint-config` 与 `@pro-monorepo/stylelint-config` 共享配置包

## 当前仍需关注的风险

- `packages/utils/src/crypto.ts` 中部分方法仍采用兼容优先策略，失败时返回空字符串；安全敏感场景不应直接依赖该默认行为。
- `packages/cli` 当前仅为占位目录，如果近期不会实现，建议删除或补充规划说明。
- 主子应用通信协议已经集中，但还没有版本号或兼容策略；协议继续扩展时，建议引入版本字段。
- 发布流程目前缺少强制的 prepublish 校验，建议后续增加自动化发布检查。

## 建议的后续演进

1. 为微前端通信协议增加版本字段和错误码。
2. 为 crypto 模块提供显式失败结果类型，替代空字符串兜底。
3. 为共享配置包补充分层版本策略和变更说明。
4. 为 packages 发布流程增加自动化校验与 changelog 约束。
