import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [vue()],
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
