/**
 * @type {import('stylelint').Config}
 * @see https://stylelint.io/user-guide/configure
 */
export default {
  extends: [
    "stylelint-config-standard", // 基础规则
    "stylelint-config-standard-vue" // Vue 文件支持
  ],
  plugins: [
    "stylelint-order" // 属性排序插件
  ],
  overrides: [
    // Less 文件使用 postcss-less 解析器
    {
      files: ["**/*.less"],
      customSyntax: "postcss-less"
    },
    // Vue 文件使用 postcss-html 解析器，以支持内联样式
    {
      files: ["**/*.vue"],
      customSyntax: "postcss-html"
    }
  ],
  rules: {
    // 选择器命名规范 - 关闭，允许任意命名
    "selector-class-pattern": null,

    // 允许的 at 规则
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "tailwind",
          "apply",
          "layer",
          "config",
          "use",
          "forward",
          "mixin",
          "include",
          "function",
          "return",
          "if",
          "else",
          "each",
          "for",
          "while"
        ]
      }
    ],

    // 函数名 - 允许 Less 函数
    "function-no-unknown": [
      true,
      {
        ignoreFunctions: [
          "v-bind",
          "percentage",
          "extract",
          "length",
          "each",
          "range",
          "min",
          "max",
          "mod",
          "pow",
          "sqrt",
          "abs",
          "sin",
          "cos",
          "tan",
          "atan",
          "pi",
          "ceil",
          "floor",
          "percentage",
          "round",
          "convert",
          "unit",
          "color",
          "data-uri",
          "default",
          "get-unit",
          "svg-gradient",
          "escape",
          "e",
          "replace",
          "isnumber",
          "isstring",
          "iscolor",
          "iskeyword",
          "isurl",
          "ispixel",
          "isem",
          "ispercentage",
          "isunit",
          "isruleset",
          "isdefined"
        ]
      }
    ],

    // 关闭过于严格的规则
    "no-descending-specificity": null,
    "selector-max-id": null,
    "selector-max-type": null,
    "selector-no-qualifying-type": null,
    "selector-pseudo-class-no-unknown": [
      true,
      {
        ignorePseudoClasses: ["global", "local", "deep", "v-deep", "v-global", "v-slotted"]
      }
    ],
    "selector-pseudo-element-no-unknown": [
      true,
      {
        ignorePseudoElements: ["v-deep", "v-global", "v-slotted"]
      }
    ],

    // 颜色 - 允许简写格式
    "color-hex-length": null,
    "color-named": "never",
    "color-function-notation": null,
    "alpha-value-notation": null,

    // 声明块
    "declaration-block-no-duplicate-properties": true,
    "declaration-block-no-shorthand-property-overrides": true,

    // 属性 - 允许自定义属性
    "property-no-unknown": [
      true,
      {
        ignoreProperties: ["contains", "appearance", "primary", "secondary"]
      }
    ],
    "shorthand-property-no-redundant-values": true,

    // 属性值 - 允许 Less 变量和表达式
    "declaration-property-value-no-unknown": null,

    // 值
    "value-keyword-case": null,
    "value-no-vendor-prefix": null,

    // 注释
    "comment-no-empty": true,

    // 媒体查询
    "media-feature-name-no-unknown": true,
    "media-feature-range-notation": null,
    "media-query-no-invalid": null,

    // 关键帧
    "keyframes-name-pattern": null,

    // 字体
    "font-family-name-quotes": "always-where-recommended",
    "font-family-no-duplicate-names": true,

    // 单位 - 允许所有单位
    "unit-allowed-list": null,

    // 规则空行 - 关闭
    "rule-empty-line-before": null,

    // 关闭属性排序检查
    "order/properties-order": null
  }
};
