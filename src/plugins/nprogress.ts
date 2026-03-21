import NProgress from "nprogress";
import "nprogress/nprogress.css";

/**
 * 初始化 NProgress 进度条
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
