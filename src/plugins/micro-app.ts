import microApp from "@micro-zoe/micro-app";
import { MICRO_APP_URLS, isMicroAppDebugEnabled } from "./micro-app-config";

function debugMicroAppLog(message: string): void {
  if (isMicroAppDebugEnabled()) {
    console.log(message);
  }
}

/**
 * 初始化 MicroApp 微前端框架
 */
export function setupMicroApp(): void {
  microApp.start({
    // 使用 state 模式，避免与主应用路由冲突
    "router-mode": "state",
    // 统一预加载已经接入通信协议的子应用，减少首次切换等待时间。
    preFetchApps: [
      { name: "vite-vue", url: MICRO_APP_URLS["vite-vue"] },
      { name: "vite-react", url: MICRO_APP_URLS["vite-react"] }
    ],
    // 全局生命周期钩子
    lifeCycles: {
      created() {
        debugMicroAppLog("[MicroApp] 子应用创建");
      },
      beforemount() {
        debugMicroAppLog("[MicroApp] 子应用即将渲染");
      },
      mounted() {
        debugMicroAppLog("[MicroApp] 子应用已渲染");
      },
      unmount() {
        debugMicroAppLog("[MicroApp] 子应用已卸载");
      },
      error() {
        console.error("[MicroApp] 子应用加载出错");
      }
    }
  });
}

export default microApp;
