import { createApp } from "vue";
import "@/styles/index";
import App from "@/App.vue";
import router from "@/router";
import { setupRouterGuard } from "@/router/router-guard";
import { setupNProgress } from "@/plugins/nprogress";

// 初始化 NProgress 进度条
setupNProgress();

const app = createApp(App);

app.use(router);

// 设置路由守卫
setupRouterGuard(router);

app.mount("#app");
