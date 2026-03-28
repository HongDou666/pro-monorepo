import microApp from "@micro-zoe/micro-app";
import { MICRO_APP_URLS, isMicroAppDebugEnabled } from "./micro-app-config";

function getPreFetchApps() {
  if (import.meta.env.DEV) {
    return undefined;
  }

  return [
    { name: "vite-vue", url: MICRO_APP_URLS["vite-vue"] },
    { name: "vite-react", url: MICRO_APP_URLS["vite-react"] }
  ];
}

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
  const preFetchApps = getPreFetchApps();

  microApp.start({
    // 使用 state 模式，避免与主应用路由冲突
    "router-mode": "state",
    // 开发态下关闭预加载，避免 Vite React 注入的内联 ESM 预热脚本被 micro-app 预加载器按普通脚本执行。
    ...(preFetchApps
      ? {
          // 统一预加载已经接入通信协议的子应用，减少首次切换等待时间。
          preFetchApps
        }
      : {}),
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
