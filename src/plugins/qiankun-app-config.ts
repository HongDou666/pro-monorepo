export type QiankunSubAppName = "qiankun-vite-vue" | "qiankun-vite-react";

type QiankunSubAppUrlMap = Record<QiankunSubAppName, string>;

// 本地开发默认端口约定，环境变量未配置时自动回退到这里。
const defaultQiankunSubAppUrls: QiankunSubAppUrlMap = {
  "qiankun-vite-vue": "http://localhost:5176/",
  "qiankun-vite-react": "http://localhost:5177/"
};

/**
 * qiankun 子应用地址映射。
 *
 * 主应用可以通过环境变量切到远端联调环境，
 * 避免把入口地址硬编码在页面组件里。
 */
export const QIANKUN_SUB_APP_URLS: QiankunSubAppUrlMap = {
  "qiankun-vite-vue": import.meta.env.VITE_QIANKUN_APP_VUE_URL || defaultQiankunSubAppUrls["qiankun-vite-vue"],
  "qiankun-vite-react": import.meta.env.VITE_QIANKUN_APP_REACT_URL || defaultQiankunSubAppUrls["qiankun-vite-react"]
};

export function isQiankunDebugEnabled(): boolean {
  return import.meta.env.DEV;
}
