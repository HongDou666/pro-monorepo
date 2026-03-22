# Prettier 治理说明

本文件定义仓库级 Prettier 维护约定，用于和共享 ESLint / Stylelint 配置处于同一治理层。

## 治理目标

- 保证跨应用、跨包的基础格式一致性。
- 明确 Prettier 与 ESLint、Stylelint 的职责边界，避免规则重叠。
- 为后续调整格式约定提供统一的变更入口与评估标准。

## 单一事实来源

Prettier 相关约定以下列文件为准：

- [prettier.config.js](../prettier.config.js)：格式化主配置
- [.prettierignore](../.prettierignore)：格式化排除规则
- [.editorconfig](../.editorconfig)：跨编辑器基础缩进、换行、末尾空行约定

如果三者发生冲突，按以下优先级理解：

1. Prettier 的实际格式化行为以 [prettier.config.js](../prettier.config.js) 为准。
2. 文件是否纳入格式化范围以 [.prettierignore](../.prettierignore) 为准。
3. 编辑器默认行为与基础文本规范以 [.editorconfig](../.editorconfig) 为准。

## 当前仓库约定

- 使用 2 空格缩进。
- 默认最大行宽为 120。
- 使用双引号。
- 保留分号。
- trailing comma 关闭。
- Vue SFC 的 script 和 style 不额外增加缩进。
- 换行策略使用 `auto`，但编辑器层统一采用 LF。

## 职责边界

Prettier 只负责格式化，不负责语义与质量约束：

- JavaScript / TypeScript / Vue / React 的代码质量问题由 ESLint 负责。
- 样式语义、选择器合法性与 CSS 规则由 Stylelint 负责。
- 不要把本应由 ESLint / Stylelint 处理的问题转移到 Prettier。

当需要新增规则时，优先判断它属于哪一层：

- 纯格式问题：优先调整 Prettier。
- JS / TS / Vue / React 规范问题：优先调整 ESLint。
- CSS / Less / Scss / Vue style 问题：优先调整 Stylelint。

## 变更流程

修改 Prettier 约定时，至少执行以下动作：

1. 更新 [prettier.config.js](../prettier.config.js)、[.prettierignore](../.prettierignore) 或 [.editorconfig](../.editorconfig) 中真正的事实来源文件。
2. 同步检查 [README.md](../README.md) 中的治理说明是否仍然准确。
3. 说明本次变更影响范围，是全仓格式变化还是仅针对新增文件类型。
4. 运行 `pnpm lint:prettier`，确认格式化行为符合预期。
5. 如果会导致大规模代码重排，拆分为独立提交，避免和功能改动混在一起。

## 何时允许修改

以下情况适合调整 Prettier 约定：

- 新增文件类型需要稳定格式化支持。
- 当前格式化结果与团队长期约定明显冲突。
- 编辑器默认行为与仓库统一约定不一致，导致频繁无效 diff。
- 为配合共享 ESLint / Stylelint 配置，减少规则重叠与噪音。

以下情况不建议修改：

- 仅为个人编辑器偏好。
- 仅为某个局部文件追求特殊排版。
- 可以通过重构代码结构解决，却试图用 Prettier 选项绕过。

## 提交建议

- 单独修改格式化治理文件时，优先使用 `prettier` 作为 commit scope。
- 如果同时修改共享 lint 配置，可按实际主影响面使用 `eslint-config`、`stylelint-config` 或 `prettier`。
- 大规模格式化提交应避免混入功能逻辑变更。

## 维护建议

- 新增应用和包时，不要创建独立的 Prettier 配置，默认继承仓库根配置。
- 如果确实需要特殊格式化行为，应先评估能否通过忽略规则或局部代码结构调整解决。
- 对自动生成文件，优先通过 [.prettierignore](../.prettierignore) 排除，而不是在业务目录中散落例外配置。
