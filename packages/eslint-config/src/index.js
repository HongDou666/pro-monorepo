import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import eslintPluginPrettier from "eslint-plugin-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import eslintPluginVue from "eslint-plugin-vue";
import globals from "globals";
import tseslint from "typescript-eslint";

export const sharedIgnores = [
  "**/dist/**",
  "**/node_modules/**",
  "**/.git/**",
  "**/.vscode/**",
  "**/coverage/**",
  "**/*.d.ts",
  "**/*.local",
  "**/*.log*",
  "**/temp/**",
  "**/.cache/**"
];

const sharedRules = {
  ...eslint.configs.recommended.rules,
  "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
  "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
  "no-unused-vars": "off",
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
    { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] },
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
};

const sharedTypescriptRules = {
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

const sharedVueRules = {
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

function createParserOptions(tsconfigRootDir, jsx = false) {
  return {
    tsconfigRootDir,
    ...(jsx
      ? {
          ecmaFeatures: {
            jsx: true
          }
        }
      : {})
  };
}

function createSharedLanguageOptions({ tsconfigRootDir, globalEntries = {}, jsx = false }) {
  return {
    ecmaVersion: "latest",
    sourceType: "module",
    globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.es2021,
      ...globalEntries
    },
    parserOptions: createParserOptions(tsconfigRootDir, jsx)
  };
}

function createEslintConfigFileOverride() {
  return {
    files: ["eslint.config.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        URL: "readonly"
      }
    }
  };
}

export function createMonorepoEslintConfig({ tsconfigRootDir, autoImportGlobals = {} }) {
  return [
    {
      ignores: [...sharedIgnores, "scripts/**"]
    },
    {
      languageOptions: {
        parserOptions: {
          tsconfigRootDir
        }
      }
    },
    {
      languageOptions: createSharedLanguageOptions({
        tsconfigRootDir,
        globalEntries: autoImportGlobals,
        jsx: true
      }),
      rules: sharedRules
    },
    ...tseslint.configs.recommended,
    {
      files: ["**/*.ts", "**/*.tsx", "**/*.vue"],
      rules: sharedTypescriptRules
    },
    ...eslintPluginVue.configs["flat/recommended"],
    {
      files: ["**/*.vue"],
      languageOptions: {
        parserOptions: {
          tsconfigRootDir,
          parser: tseslint.parser
        }
      },
      rules: sharedVueRules
    },
    eslintConfigPrettier,
    {
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
    }
  ];
}

export function createVueAppEslintConfig({ tsconfigRootDir, globalEntries = {} }) {
  return [
    {
      ignores: ["dist/**", "node_modules/**", "*.d.ts"]
    },
    {
      languageOptions: {
        parserOptions: {
          tsconfigRootDir
        }
      }
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    ...eslintPluginVue.configs["flat/recommended"],
    {
      files: ["**/*.vue"],
      languageOptions: {
        ...createSharedLanguageOptions({
          tsconfigRootDir,
          globalEntries
        }),
        parserOptions: {
          ...createParserOptions(tsconfigRootDir),
          parser: tseslint.parser
        }
      },
      rules: {
        "vue/multi-word-component-names": "off",
        "vue/no-unused-vars": ["error", { ignorePattern: "^_" }],
        "vue/no-v-html": "off",
        "vue/require-default-prop": "off",
        "vue/singleline-html-element-content-newline": "off",
        "vue/max-attributes-per-line": "off",
        "vue/html-self-closing": "off",
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
        "@typescript-eslint/no-explicit-any": "warn",
        "no-console": "off",
        "no-debugger": "warn",
        "prefer-const": "error",
        "no-var": "error"
      }
    },
    createEslintConfigFileOverride(),
    {
      files: ["**/*.ts"],
      languageOptions: createSharedLanguageOptions({
        tsconfigRootDir,
        globalEntries
      }),
      rules: {
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
        "@typescript-eslint/no-explicit-any": "warn",
        "no-console": "off",
        "no-debugger": "warn",
        "prefer-const": "error",
        "no-var": "error"
      }
    }
  ];
}

export function createReactAppEslintConfig({ tsconfigRootDir }) {
  return [
    {
      ignores: ["dist/**", "node_modules/**", "*.d.ts", "eslint.config.js"]
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    createEslintConfigFileOverride(),
    {
      files: ["**/*.{ts,tsx}"],
      languageOptions: createSharedLanguageOptions({
        tsconfigRootDir,
        jsx: true
      }),
      plugins: {
        "react-hooks": reactHooks,
        "react-refresh": reactRefresh
      },
      rules: {
        ...reactHooks.configs.recommended.rules,
        "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
        "@typescript-eslint/no-explicit-any": "warn",
        "no-console": "off",
        "no-debugger": "warn",
        "prefer-const": "error",
        "no-var": "error"
      }
    }
  ];
}
