import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    UnoCSS(),
    AutoImport({
      imports: ["react", "react-router-dom"],
      dts: "src/auto-imports.d.ts"
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/antd/")) {
            return "vendor-antd-react";
          }

          if (id.includes("react-router-dom") || id.includes("react-dom") || id.includes("/react/")) {
            return "vendor-react";
          }

          return undefined;
        }
      }
    }
  },
  server: {
    port: 5175,
    headers: {
      // 允许跨域访问，供 micro-app 嵌入
      "Access-Control-Allow-Origin": "*"
    }
  }
});
