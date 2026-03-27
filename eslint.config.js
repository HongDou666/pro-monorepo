import { defineConfig } from "eslint/config";
import { fileURLToPath } from "node:url";
import { createMonorepoEslintConfig } from "@pro-monorepo/eslint-config";
import autoImportGlobals from "./.eslint-auto-import.json" with { type: "json" };

// 对 flat config 来说，tsconfigRootDir 需要明确指向仓库根目录，避免解析到错误层级。
const tsconfigRootDir = fileURLToPath(new URL(".", import.meta.url));

/**
 * 仓库级 ESLint 配置。
 *
 * 组织方式分两层：
 * 1. 先复用 packages/eslint-config 中的统一 monorepo 基线。
 * 2. 再按组件库、工具库、应用源码分别做小范围补充。
 */
export default defineConfig([
  ...createMonorepoEslintConfig({
    tsconfigRootDir,
    autoImportGlobals: autoImportGlobals.globals
  }),

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
