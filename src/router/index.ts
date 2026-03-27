import type { RouteRecordRaw } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";

/**
 * 主应用路由表。
 *
 * 目前只保留首页、微前端页和兜底页三类路由，
 * 目的是让仓库把重点放在 monorepo 基建和微前端演示上。
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
 * 创建路由实例。
 *
 * history 基于 BASE_URL，便于未来部署到子路径时复用同一套构建产物。
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
