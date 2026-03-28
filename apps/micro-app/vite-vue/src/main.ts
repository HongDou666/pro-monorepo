import { createApp } from "vue";
import { MOCK_APP_SCOPE, setupMockInDev } from "@pro-monorepo/mock";
import "ant-design-vue/dist/reset.css";
import "virtual:uno.css";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { cancelVueMicroRequests } from "./api/http";

/**
 * Vue 子应用启动入口。
 *
 * 这个入口同时要兼容两种运行方式：
 * 1. 独立开发运行，直接作为普通 Vite 应用启动。
 * 2. 被主应用通过 micro-app 托管，在容器中渲染。
 *
 * 因此入口只做最基础的装配，不耦合主应用专属逻辑。
 */
// Vue 子应用通过共享包统一初始化开发态 Mock.js。
void setupMockInDev(MOCK_APP_SCOPE.MICRO_APP_VUE);

const app = createApp(App);

// 路由切换时主动取消当前子应用未完成请求，避免旧页面响应回写到新页面。
router.beforeEach((to, from, next) => {
  if (to.fullPath !== from.fullPath) {
    cancelVueMicroRequests(`Vue micro route switching to ${to.fullPath}`);
  }

  next();
});

app.use(router);

// 子应用始终挂载到自己的 #app，是否被主应用托管由 micro-app 容器决定。
app.mount("#app");
