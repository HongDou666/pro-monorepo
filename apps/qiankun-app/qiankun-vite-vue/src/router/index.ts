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
  // 通信面板依赖 antd 组件和 qiankun global state 逻辑，按需懒加载更合适。
  {
    path: "/communication",
    name: "communication",
    component: () => import("../views/CommunicationView.vue")
  },
  // 请求示例页包含共享 axios 调用与状态展示，同样放到异步页面中。
  {
    path: "/http",
    name: "http",
    component: () => import("../views/HttpView.vue")
  },
  // 所有未知路径统一回退首页，避免 MemoryHistory 下出现仅有壳层、没有内容的状态。
  {
    path: "/:pathMatch(.*)*",
    redirect: "/"
  }
];

/**
 * 根据运行模式创建 router。
 *
 * 独立运行时使用浏览器地址栏历史；
 * 被主应用托管时使用内存路由，避免子应用内部切换污染主应用 URL。
 */
export function createQiankunVueRouter(asMicroApp = false) {
  return createRouter({
    history: asMicroApp ? createMemoryHistory() : createWebHistory(),
    routes
  });
}

// 独立运行模式下默认导出一份 web history router，方便本地开发直接启动。
const router = createQiankunVueRouter();

export default router;
