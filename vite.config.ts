import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          /* 这个报错不像子应用请求失败，更像主应用页面自身在无限递归渲染。你这个页面文件名就是 MicroApp.vue，而模板里又写了 <micro-app>，Vue 会把它优先当成“当前组件自引用”，这正好对应 runtime-core 的栈溢出 */
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
      "@pro-monorepo/utils": fileURLToPath(new URL("./packages/utils/src", import.meta.url))
    }
  }
});
