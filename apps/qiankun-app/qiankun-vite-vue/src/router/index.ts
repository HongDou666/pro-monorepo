import { createMemoryHistory, createRouter, createWebHistory } from "vue-router";

/**
 * 子应用路由使用懒加载页面。
 *
 * 这样首页只加载轻量壳和欢迎页，其余演示页会被拆到异步 chunk。
 * 对微前端来说，这一点尤其重要，因为子应用首屏通常需要尽快完成挂载，
 * 避免主应用容器长时间显示空白或 loading。
 */
const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/HomeView.vue")
  },
  {
    path: "/http",
    name: "http",
    component: () => import("../views/HttpView.vue")
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/"
  }
];

export function createQiankunVueRouter(asMicroApp = false) {
  return createRouter({
    history: asMicroApp ? createMemoryHistory() : createWebHistory(),
    routes
  });
}

const router = createQiankunVueRouter();

export default router;
