import type { RouteRecordRaw } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";

/**
 * 路由配置
 */
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/views/Home.vue"),
    meta: {
      title: "首页"
    }
  },
  {
    path: "/micro-app",
    name: "MicroApp",
    component: () => import("@/views/MicroApp.vue"),
    meta: {
      title: "微前端应用"
    }
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
    meta: {
      title: "页面未找到"
    }
  }
];

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
