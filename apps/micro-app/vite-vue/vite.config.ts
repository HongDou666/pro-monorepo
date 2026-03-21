import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174,
    headers: {
      // 允许跨域访问，供 micro-app 嵌入
      "Access-Control-Allow-Origin": "*"
    }
  }
});
