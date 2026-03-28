import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  test: {
    globals: true, // 启用全局测试 API，如 describe、it、expect 等
    projects: [
      // utils 包测试 - 使用 jsdom 环境模拟浏览器 API
      {
        test: {
          name: "utils",
          include: ["packages/utils/__test__/**/*.{test,spec}.{ts,js}"],
          exclude: ["node_modules", "dist"],
          environment: "jsdom" // 使用 jsdom 环境，模拟浏览器 API
        }
      },
      // axios 包测试 - 使用 jsdom 环境模拟 AbortController 等浏览器 API
      {
        test: {
          name: "axios",
          include: ["packages/axios/__test__/**/*.{test,spec}.{ts,js}"],
          exclude: ["node_modules", "dist"],
          environment: "jsdom" // 使用 jsdom 环境，模拟浏览器 API，如 AbortController
        }
      },
      // components 包测试 - 浏览器模式（打开浏览器窗口）
      {
        plugins: [vue()],
        test: {
          name: "components",
          include: ["packages/components/__test__/**/*.{test,spec}.{ts,js,tsx}"],
          exclude: ["node_modules", "dist"],
          // 浏览器模式配置
          browser: {
            enabled: true,
            provider: playwright({
              launchOptions: {
                headless: process.env.CI === "true" // CI 环境下默认使用无头模式，其他环境打开浏览器窗口
              }
            }),
            // 必须指定 instances
            instances: [
              {
                browser: "chromium" // 指定使用 Chromium 浏览器进行测试
              }
            ]
          }
        }
      }
    ]
  }
});
