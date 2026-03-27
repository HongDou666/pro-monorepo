import microApp from "@micro-zoe/micro-app";
import { MICRO_APP_URLS, isMicroAppDebugEnabled } from "./micro-app-config";

function debugMicroAppLog(message: string): void {
  // 调试日志统一收口，避免到处散落 import.meta.env.DEV 判断。
  if (isMicroAppDebugEnabled()) {
    console.log(message);
  }
}

/**
 * 初始化 micro-app 容器。
 *
 * 这里负责配置一次全局行为：
 * 1. 路由模式，避免与主应用 history 冲突。
 * 2. 预加载策略，降低首次切换到子应用时的等待。
 * 3. 生命周期日志，方便排查子应用装载问题。
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
