import type { MicroAppName } from "../../shared/micro-app/communication";

type MicroAppUrlMap = Record<MicroAppName, string>;

// 本地开发默认端口约定，环境变量未配置时自动回退到这里。
const defaultMicroAppUrls: MicroAppUrlMap = {
  "vite-vue": "http://localhost:5174/",
  "vite-react": "http://localhost:5175/"
};

/**
 * 子应用地址映射。
 *
 * 优先读取环境变量，便于在联调、预发或远端子应用部署场景下复用同一份主应用代码。
 */
export const MICRO_APP_URLS: MicroAppUrlMap = {
  "vite-vue": import.meta.env.VITE_MICRO_APP_VUE_URL || defaultMicroAppUrls["vite-vue"],
  "vite-react": import.meta.env.VITE_MICRO_APP_REACT_URL || defaultMicroAppUrls["vite-react"]
};

/**
 * 是否输出 micro-app 调试日志。
 *
 * 当前仅开发环境开启，避免生产环境控制台产生无价值日志噪声。
 */
export function isMicroAppDebugEnabled(): boolean {
  return import.meta.env.DEV;
}
