import { defineConfig } from "eslint/config";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettier from "eslint-plugin-prettier";
import eslintPluginVue from "eslint-plugin-vue";
import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier/flat";

/**
 * 忽略文件配置
 */
const ignores = [
  "**/dist/**",
  "**/node_modules/**",
  "**/.git/**",
  "**/.vscode/**",
  "**/coverage/**",
  "**/*.d.ts",
  "**/*.local",
  "**/*.log*",
  "scripts/**",
  "**/temp/**",
  "**/.cache/**"
];

/**
 * 通用 JavaScript/TypeScript 配置
 */
const baseConfig = {
  languageOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.es2021
    },
    parserOptions: {
      ecmaFeatures: {
        jsx: true
      }
    }
  },
  rules: {
    // ESLint 基础规则
    ...eslint.configs.recommended.rules,

    // 代码质量规则
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-unused-vars": "off",

    // 最佳实践
    "no-var": "error",
    "prefer-const": "error",
    "prefer-arrow-callback": "error",
    "no-new-func": "error",
    "no-implied-eval": "error",
    "no-eval": "error",
    "no-with": "error",
    "no-extend-native": "error",
    "no-octal": "error",
    "no-octal-escape": "error",
    "no-proto": "error",
    "no-return-await": "error",
    "no-script-url": "error",
    "no-self-compare": "error",
    "no-sequences": "error",
    "no-throw-literal": "error",
    "no-unmodified-loop-condition": "error",
    "no-unused-expressions": ["error", { allowShortCircuit: true, allowTernary: true }],
    "no-useless-call": "error",
    "no-useless-concat": "error",
    "no-useless-return": "error",
    "prefer-promise-reject-errors": "error",
    "require-await": "error",

    // 代码风格
    "array-bracket-newline": ["error", { multiline: true, minItems: 3 }],
    "array-bracket-spacing": ["error", "never"],
    "block-spacing": ["error", "always"],
    "brace-style": ["error", "1tbs", { allowSingleLine: true }],
    "comma-dangle": ["error", "never"],
    "comma-spacing": ["error", { before: false, after: true }],
    "comma-style": ["error", "last"],
    "computed-property-spacing": ["error", "never"],
    "dot-location": ["error", "property"],
    "eol-last": ["error", "always"],
    "func-call-spacing": ["error", "never"],
    "function-paren-newline": ["error", "multiline"],
    "implicit-arrow-linebreak": ["error", "beside"],
    indent: "off",
    "key-spacing": ["error", { beforeColon: false, afterColon: true }],
    "keyword-spacing": ["error", { before: true, after: true }],
    "lines-between-class-members": ["error", "always", { exceptAfterSingleLine: true }],
    "max-len": "off",
    "multiline-ternary": ["error", "always-multiline"],
    "new-cap": ["error", { newIsCap: true, capIsNew: false }],
    "new-parens": "error",
    "no-multi-spaces": "error",
    "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0, maxEOF: 0 }],
    "no-trailing-spaces": "error",
    "no-whitespace-before-property": "error",
    "nonblock-statement-body-position": ["error", "beside"],
    "object-curly-newline": ["error", { multiline: true, consistent: true }],
    "object-curly-spacing": ["error", "always"],
    "operator-linebreak": ["error", "before"],
    "padded-blocks": ["error", "never"],
    "padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: "*", next: "return" },
      { blankLine: "always", prev: ["const", "let", "var"], next: "*" },
      {
        blankLine: "any",
        prev: ["const", "let", "var"],
        next: ["const", "let", "var"]
      },
      { blankLine: "always", prev: "directive", next: "*" },
      { blankLine: "any", prev: "directive", next: "directive" }
    ],
    "quote-props": ["error", "as-needed"],
    quotes: ["error", "double", { avoidEscape: true, allowTemplateLiterals: true }],
    semi: ["error", "always"],
    "semi-spacing": ["error", { before: false, after: true }],
    "semi-style": ["error", "last"],
    "space-before-blocks": ["error", "always"],
    "space-before-function-paren": ["error", { anonymous: "always", named: "never", asyncArrow: "always" }],
    "space-in-parens": ["error", "never"],
    "space-infix-ops": "error",
    "space-unary-ops": ["error", { words: true, nonwords: false }],
    "switch-colon-spacing": ["error", { after: true, before: false }],
    "template-curly-spacing": ["error", "never"],
    "template-tag-spacing": ["error", "never"],
    "wrap-iife": ["error", "any", { functionPrototypeMethods: true }],
    "yield-star-spacing": ["error", "after"]
  }
};

/**
 * TypeScript 扩展规则
 */
const typescriptRules = {
  "no-unused-vars": "off",
  "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
  "@typescript-eslint/no-explicit-any": "warn",
  "@typescript-eslint/explicit-function-return-type": "off",
  "@typescript-eslint/explicit-module-boundary-types": "off",
  "@typescript-eslint/no-non-null-assertion": "warn",
  "@typescript-eslint/no-empty-function": "off",
  "@typescript-eslint/no-inferrable-types": "off",
  "@typescript-eslint/ban-ts-comment": ["error", { "ts-ignore": "allow-with-description" }],
  "@typescript-eslint/ban-types": "off",
  "@typescript-eslint/no-empty-interface": "off",
  "@typescript-eslint/no-namespace": "off",
  "@typescript-eslint/no-require-imports": "off",
  "@typescript-eslint/no-var-requires": "off",
  "@typescript-eslint/prefer-as-const": "error",
  "@typescript-eslint/prefer-for-of": "error",
  "@typescript-eslint/prefer-function-type": "error",
  "@typescript-eslint/prefer-nullish-coalescing": "off",
  "@typescript-eslint/prefer-optional-chain": "off",
  "@typescript-eslint/prefer-string-starts-ends-with": "off",
  "@typescript-eslint/require-array-sort-compare": "off",
  "@typescript-eslint/restrict-template-expressions": "off",
  "@typescript-eslint/strict-boolean-expressions": "off",
  "@typescript-eslint/triple-slash-reference": "off",
  "@typescript-eslint/no-unnecessary-type-assertion": "off",
  "@typescript-eslint/consistent-type-assertions": [
    "error",
    { assertionStyle: "as", objectLiteralTypeAssertions: "never" }
  ],
  "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports", disallowTypeAnnotations: false }],
  "@typescript-eslint/naming-convention": [
    "error",
    {
      selector: "variable",
      format: ["camelCase", "PascalCase", "UPPER_CASE"],
      leadingUnderscore: "allow",
      trailingUnderscore: "allow"
    },
    {
      selector: "function",
      format: ["camelCase", "PascalCase"],
      leadingUnderscore: "allow",
      trailingUnderscore: "allow"
    },
    {
      selector: "typeLike",
      format: ["PascalCase"],
      leadingUnderscore: "allow",
      trailingUnderscore: "allow"
    },
    {
      selector: "interface",
      format: ["PascalCase"],
      leadingUnderscore: "allow",
      trailingUnderscore: "allow",
      custom: {
        regex: "^I[A-Z]",
        match: false
      }
    },
    {
      selector: "enumMember",
      format: ["PascalCase", "UPPER_CASE"]
    }
  ]
};

/**
 * Vue 规则配置
 */
const vueRules = {
  "vue/no-unused-components": "warn",
  "vue/no-unused-vars": ["error", { ignorePattern: "^_" }],
  "vue/multi-word-component-names": "off",
  "vue/no-v-html": "off",
  "vue/attributes-order": [
    "error",
    {
      order: [
        "DEFINITION",
        "LIST_RENDERING",
        "CONDITIONALS",
        "RENDER_MODIFIERS",
        "GLOBAL",
        "UNIQUE",
        "TWO_WAY_BINDING",
        "OTHER_DIRECTIVES",
        "OTHER_ATTR",
        "EVENTS",
        "CONTENT"
      ],
      alphabetical: false
    }
  ],
  "vue/attribute-hyphenation": ["error", "always"],
  "vue/component-definition-name-casing": ["error", "PascalCase"],
  "vue/first-attribute-linebreak": ["error", { singleline: "ignore", multiline: "below" }],
  "vue/html-closing-bracket-newline": ["error", { singleline: "never", multiline: "always" }],
  "vue/html-closing-bracket-spacing": "error",
  "vue/html-end-tags": "error",
  "vue/html-indent": [
    "error",
    2,
    {
      attribute: 1,
      baseIndent: 1,
      closeBracket: 0,
      alignAttributesVertically: true,
      ignores: []
    }
  ],
  "vue/html-quotes": ["error", "double"],
  "vue/html-self-closing": [
    "error",
    {
      html: { void: "always", normal: "never", component: "always" },
      svg: "always",
      math: "always"
    }
  ],
  "vue/max-attributes-per-line": ["error", { singleline: { max: 3 }, multiline: { max: 1 } }],
  "vue/multiline-html-element-content-newline": ["error", { ignoreEmptyElement: true }],
  "vue/mustache-interpolation-spacing": ["error", "always"],
  "vue/no-reserved-component-names": "error",
  "vue/no-template-shadow": "error",
  "vue/one-component-per-file": "error",
  "vue/prop-name-casing": ["error", "camelCase"],
  "vue/require-default-prop": "off",
  "vue/require-explicit-emits": "warn",
  "vue/require-prop-types": "warn",
  "vue/script-indent": ["error", 2, { baseIndent: 1, switchCase: 1 }],
  "vue/singleline-html-element-content-newline": "off",
  "vue/static-class-names-order": "error",
  "vue/v-bind-style": ["error", "shorthand"],
  "vue/v-on-style": ["error", "shorthand"],
  "vue/v-slot-style": ["error", { atComponent: "shorthand", default: "shorthand", named: "shorthand" }],
  "vue/no-ref-as-operand": "error",
  "vue/no-setup-props-destructure": "off"
};

/**
 * Prettier 插件配置
 */
const prettierPluginConfig = {
  plugins: {
    prettier: eslintPluginPrettier
  },
  rules: {
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto"
      }
    ]
  }
};

export default defineConfig([
  // 忽略文件配置
  {
    ignores: ignores
  },

  // 基础 JavaScript/TypeScript 配置
  baseConfig,

  // TypeScript 配置
  ...tseslint.configs.recommended,

  // TypeScript 额外规则
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.vue"],
    rules: typescriptRules
  },

  // Vue 配置
  ...eslintPluginVue.configs["flat/recommended"],

  // Vue 额外配置
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser
      }
    },
    rules: vueRules
  },

  // Prettier 配置
  eslintConfigPrettier,

  // Prettier 插件
  prettierPluginConfig,

  // 组件库配置
  {
    files: ["packages/components/**/*.ts", "packages/components/**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "error",
      "vue/no-undef-components": "error",
      "vue/define-emits-declaration": ["error", "type-based"],
      "vue/define-macros-order": [
        "error",
        {
          order: ["defineProps", "defineEmits"]
        }
      ]
    }
  },

  // 工具库配置
  {
    files: ["packages/utils/**/*.ts"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": ["warn", { allowExpressions: true }],
      "@typescript-eslint/explicit-module-boundary-types": "warn"
    }
  },

  // 应用配置
  {
    files: ["apps/**/*.ts", "apps/**/*.vue", "apps/**/*.tsx"],
    rules: {
      "no-console": "off"
    }
  },

  // 主应用配置
  {
    files: ["src/**/*.ts", "src/**/*.vue"],
    rules: {
      "no-console": "off"
    }
  }
]);
