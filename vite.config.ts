import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import { fileURLToPath, URL } from "node:url";

/**
 * 主应用 Vite 配置。
 *
 * 重点在三件事：
 * 1. 识别 micro-app 自定义元素，避免被 Vue 当成本地组件递归解析。
 * 2. 接入 UnoCSS、自动导入与组件自动注册，提高样板代码复用率。
 * 3. 通过别名直接指向 packages 源码，便于主应用开发时联调本地包。
 */
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 告诉 Vue: <micro-app> 是原生自定义元素，不要按 Vue 组件去解析。
          isCustomElement: tag => tag === "micro-app"
        }
      }
    }),
    UnoCSS(),
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
    }),
    Components({
      // 自动导入组件的目录
      dirs: ["src/components"],
      // 组件的有效扩展名
      extensions: ["vue"],
      // 搜索子目录
      deep: true,
      // 生成 TypeScript 类型声明文件
      dts: "src/types/components.d.ts",
      // 组件名称解析配置
      resolvers: [
        // Ant Design Vue 组件自动导入
        AntDesignVueResolver({
          importStyle: false // css 在 main.ts 中全局引入
        })
      ]
    })
  ],
  resolve: {
    alias: {
      // 主应用别名
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // node_modules 别名 (用于引入 node_modules 中的包)
      "~": fileURLToPath(new URL("./node_modules", import.meta.url)),
      // 公共包别名
      "@pro-monorepo/axios": fileURLToPath(new URL("./packages/axios/src", import.meta.url)),
      "@pro-monorepo/components": fileURLToPath(new URL("./packages/components/src", import.meta.url)),
      "@pro-monorepo/mock": fileURLToPath(new URL("./packages/mock/src", import.meta.url)),
      "@pro-monorepo/utils": fileURLToPath(new URL("./packages/utils/src", import.meta.url))
    }
  }
});
