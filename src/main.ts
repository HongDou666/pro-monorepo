import { createApp } from "vue";
import { MOCK_APP_SCOPE, setupMockInDev } from "@pro-monorepo/mock";
import "@/styles/index";
import App from "@/App.vue";
import { setupQiankun } from "@/plugins/qiankun";
import router from "@/router";
import { setupRouterGuard } from "@/router/router-guard";
import { setupNProgress } from "@/plugins/nprogress";
import { setupMicroApp } from "@/plugins/micro-app";

/**
 * 主应用启动入口。
 *
 * 启动顺序保持明确：
 * 1. 先初始化全局插件和运行时能力。
 * 2. 再创建 Vue 应用并注册路由。
 * 3. 挂载前等待路由 ready，避免首屏因异步路由状态抖动。
 */
async function bootstrap() {
  // 开发态统一启用共享 Mock.js，生产环境则直接跳过。
  await setupMockInDev(MOCK_APP_SCOPE.MAIN_APP);

  // 先配置进度条，再注册路由守卫，确保首个路由跳转也能显示反馈。
  setupNProgress();

  // micro-app 需要尽早启动，以便主应用页面首次进入微前端容器时能立即接管生命周期。
  setupMicroApp();

  // qiankun 只需要全局启动一次，具体子应用由页面组件按需装载。
  setupQiankun();

  // 从这里开始进入 Vue 应用装配阶段。
  const app = createApp(App);

  // 路由需要先注册，后续守卫和 isReady 才有意义。
  app.use(router);

  // 守卫里统一处理标题、进度条和请求取消等横切逻辑。
  setupRouterGuard(router);

  // 等待初始异步路由解析完成，减少首屏闪动和重复渲染。
  await router.isReady();

  // 所有前置能力就绪后再挂载到 DOM。
  app.mount("#app");
}

// 通过 void 显式忽略 Promise，避免未处理返回值的 lint 噪声。
void bootstrap();
