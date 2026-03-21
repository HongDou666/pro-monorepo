import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      // 自动导入 Vue 3 Composition API
      imports: ["vue", "vue-router"],
      // 生成 TypeScript 类型声明文件
      dts: "src/types/auto-imports.d.ts",
      // ESLint 支持
      eslintrc: {
        enabled: true,
        filepath: "./.eslint-auto-import.json",
        globalsPropValue: "readonly"
      },
      // 目录导入（自动导入 composables 和 stores 目录下的导出）
      dirs: ["src/composables", "src/stores"]
    })
  ],
  resolve: {
    alias: {
      // 主应用别名
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // node_modules 别名 (用于引入 node_modules 中的包)
      "~": fileURLToPath(new URL("./node_modules", import.meta.url)),
      // 公共包别名
      "@pro-monorepo/components": fileURLToPath(new URL("./packages/components/src", import.meta.url)),
      "@pro-monorepo/utils": fileURLToPath(new URL("./packages/utils/src", import.meta.url))
    }
  }
});
