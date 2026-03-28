import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import qiankun from "vite-plugin-qiankun";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const useDevMode = command === "serve";

  return {
    plugins: [
      ...(useDevMode ? [] : [react()]),
      qiankun("qiankun-vite-react", {
        useDevMode
      }),
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
    resolve: {
      alias: {
        "@pro-monorepo/axios": fileURLToPath(new URL("../../../packages/axios/src", import.meta.url)),
        "@pro-monorepo/mock": fileURLToPath(new URL("../../../packages/mock/src", import.meta.url))
      }
    },
    server: {
      port: 5177,
      headers: {
        // 允许跨域访问，供 qiankun 主应用装载。
        "Access-Control-Allow-Origin": "*"
      }
    }
  };
});
