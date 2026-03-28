import "vue-router";

/**
 * 扩展路由元信息类型
 */
declare module "vue-router" {
  interface RouteMeta {
    /**
     * 页面标题
     */
    title?: string;

    /**
     * 是否在主导航中展示
     */
    showInMenu?: boolean;

    /**
     * 是否需要登录
     */
    requiresAuth?: boolean;

    /**
     * 是否缓存页面
     */
    keepAlive?: boolean;

    /**
     * 页面图标
     */
    icon?: string;

    /**
     * 是否隐藏菜单
     */
    hidden?: boolean;
  }
}
