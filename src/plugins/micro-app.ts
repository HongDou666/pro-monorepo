import microApp from "@micro-zoe/micro-app";

/**
 * 初始化 MicroApp 微前端框架
 */
export function setupMicroApp(): void {
  microApp.start({
    // 使用 state 模式，避免与主应用路由冲突
    "router-mode": "state",
    // 统一预加载已经接入通信协议的子应用，减少首次切换等待时间。
    preFetchApps: [
      { name: "vite-vue", url: "http://localhost:5174/" },
      { name: "vite-react", url: "http://localhost:5175/" }
    ],
    // 全局生命周期钩子
    lifeCycles: {
      created() {
        console.log("[MicroApp] 子应用创建");
      },
      beforemount() {
        console.log("[MicroApp] 子应用即将渲染");
      },
      mounted() {
        console.log("[MicroApp] 子应用已渲染");
      },
      unmount() {
        console.log("[MicroApp] 子应用已卸载");
      },
      error() {
        console.error("[MicroApp] 子应用加载出错");
      }
    }
  });
}

export default microApp;
