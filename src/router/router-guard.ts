import type { Router } from "vue-router";
import NProgress from "@/plugins/nprogress";
import { cancelMainHttpRequests } from "@/api/http";

/**
 * 注册主应用路由守卫。
 *
 * 这里集中放置“每次路由切换都需要发生”的横切动作，
 * 避免散落在页面组件中重复实现。
 * @param router 路由实例
 */
export function setupRouterGuard(router: Router): void {
  // 前置守卫负责“开始切换前”的副作用。
  router.beforeEach((to, _from, next) => {
    // 进度条尽早启动，用户能感知路由正在切换。
    NProgress.start();

    // 路由切换前取消当前主应用中尚未完成的请求，避免页面切走后旧响应回写。
    cancelMainHttpRequests(`Main route switching to ${to.path}`);

    // title 来自路由元信息，保持文案和路由定义同源。
    const title = to.meta.title as string;

    if (title) {
      document.title = `${title} - Pro Monorepo`;
    }
    next();
  });

  // 后置守卫负责“切换成功后”的收尾动作。
  router.afterEach(() => {
    // 无论页面组件是否还有异步逻辑，路由解析完成后先关闭进度条。
    NProgress.done();

    // 主应用页面切换后统一回到顶部，符合常见后台/门户交互预期。
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  });

  // 发生路由懒加载失败或守卫报错时，也必须保证进度条被关闭。
  router.onError(() => {
    NProgress.done();
  });
}
