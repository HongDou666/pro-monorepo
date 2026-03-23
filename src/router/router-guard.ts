import type { Router } from "vue-router";
import NProgress from "@/plugins/nprogress";
import { cancelMainHttpRequests } from "@/api/http";

/**
 * 设置路由守卫
 * @param router 路由实例
 */
export function setupRouterGuard(router: Router): void {
  // 前置守卫 - 设置页面标题、启动进度条
  router.beforeEach((to, _from, next) => {
    // 启动进度条
    NProgress.start();

    // 路由切换前取消当前主应用中尚未完成的请求，避免页面切走后旧响应回写。
    cancelMainHttpRequests(`Main route switching to ${to.path}`);

    // 设置页面标题
    const title = to.meta.title as string;

    if (title) {
      document.title = `${title} - Pro Monorepo`;
    }
    next();
  });

  // 后置守卫 - 关闭进度条、页面滚动到顶部
  router.afterEach(() => {
    // 关闭进度条
    NProgress.done();

    // 页面滚动到顶部
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  });

  // 错误处理 - 进度条关闭
  router.onError(() => {
    NProgress.done();
  });
}
