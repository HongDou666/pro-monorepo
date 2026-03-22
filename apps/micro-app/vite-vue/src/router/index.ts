import { createRouter, createWebHistory } from "vue-router";

/**
 * 子应用路由使用懒加载页面。
 *
 * 这样首页只加载轻量壳和欢迎页，通信页中的 antd 组件与业务逻辑会被拆到异步 chunk。
 */
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("../views/HomeView.vue")
    },
    {
      path: "/communication",
      name: "communication",
      component: () => import("../views/CommunicationView.vue")
    }
  ]
});

export default router;
