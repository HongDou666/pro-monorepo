import NProgress from "nprogress";
import "nprogress/nprogress.css";

/**
 * 初始化全局进度条配置。
 *
 * 这里仅做一次 configure，真正的 start/done 调用由路由守卫控制。
 */
export function setupNProgress(): void {
  NProgress.configure({
    easing: "ease",
    speed: 500,
    showSpinner: false,
    trickleSpeed: 200,
    minimum: 0.3
  });
}

export default NProgress;
