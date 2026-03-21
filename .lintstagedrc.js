export default {
  // 拼写检查
  "*.{js,ts,mjs,cjs,json,tsx,css,less,scss,vue,html,md}": ["cspell lint"],

  // JS/TS/Vue 文件：Prettier 格式化 + ESLint 检查
  "*.{js,ts,vue,md}": ["prettier --write", "eslint --fix"],

  // 样式文件：Prettier 格式化 + Stylelint 检查
  "*.{css,less,scss,vue}": ["prettier --write", "stylelint --fix"]
};
