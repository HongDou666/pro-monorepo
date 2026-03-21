import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  test: {
    globals: true,
    projects: [
      // utils 包测试 - 使用 jsdom 环境模拟浏览器 API
      {
        test: {
          name: "utils",
          include: ["packages/utils/__test__/**/*.{test,spec}.{ts,js}"],
          exclude: ["node_modules", "dist"],
          environment: "jsdom"
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
                headless: false // false = 显示浏览器窗口
              }
            }),
            // 必须指定 instances
            instances: [
              {
                browser: "chromium"
              }
            ]
          }
        }
      }
    ]
  }
});
