import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    AutoImport({
      imports: ["vue", "vue-router"],
      dts: "src/auto-imports.d.ts"
    }),
    Components({
      resolvers: [
        AntDesignVueResolver({
          importStyle: false
        })
      ],
      dts: "src/components.d.ts"
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("ant-design-vue")) {
            return "vendor-antd-vue";
          }

          if (id.includes("vue-router") || id.includes("/vue/")) {
            return "vendor-vue";
          }

          return undefined;
        }
      }
    }
  },
  resolve: {
    alias: {
      "@pro-monorepo/axios": fileURLToPath(new URL("../../../packages/axios/src", import.meta.url))
    }
  },
  server: {
    port: 5174,
    headers: {
      // 允许跨域访问，供 micro-app 嵌入
      "Access-Control-Allow-Origin": "*"
    }
  }
});
