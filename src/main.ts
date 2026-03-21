import { createApp } from "vue";
import "@/styles/index";
import App from "@/App.vue";
import router from "@/router";
import { setupRouterGuard } from "@/router/router-guard";
import { setupNProgress } from "@/plugins/nprogress";
import { setupMicroApp } from "@/plugins/micro-app";

/**
 * 初始化应用
 */
async function bootstrap() {
  // 初始化 NProgress 进度条
  setupNProgress();

  // 初始化 MicroApp 微前端框架
  setupMicroApp();

  // 创建 Vue 应用实例
  const app = createApp(App);

  // 注册路由
  app.use(router);

  // 设置路由守卫
  setupRouterGuard(router);

  // 等待路由准备就绪
  await router.isReady();

  // 挂载应用
  app.mount("#app");
}

// 启动应用
void bootstrap();
