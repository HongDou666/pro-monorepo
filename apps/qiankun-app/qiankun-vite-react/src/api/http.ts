import { createHttpClient, setupHttpInterceptors } from "@pro-monorepo/axios";
import { message } from "antd";

const REACT_MICRO_ACCESS_TOKEN_KEY = "pro-monorepo:access-token";

/**
 * React 子应用请求实例。
 *
 * 这里保持与 Vue 子应用相近的策略，便于不同子应用共享同一套网络治理约定。
 * 同时通过 x-micro-app 请求头暴露来源，方便后端或日志平台识别具体子应用。
 */
export const reactMicroHttp = createHttpClient({
  axiosConfig: {
    baseURL: "/",
    timeout: 8_000,
    headers: {
      "x-micro-app": "vite-react"
    }
  },
  concurrency: {
    maxConcurrent: 4
  },
  retry: {
    retries: 2,
    retryDelay: ({ attempt }) => attempt * 300
  },
  cache: {
    enabled: true,
    ttl: 10_000
  }
});

/**
 * 为 React 子应用挂载统一拦截器。
 *
 * 页面层只关注具体业务调用，token 注入、错误提示和登录态失效处理由这里接管。
 */
setupHttpInterceptors(reactMicroHttp, {
  getToken: () => getReactMicroAccessToken(),
  showError: (errorMessage: string) => {
    void message.error(errorMessage);
  },
  onUnauthorized: () => {
    clearReactMicroAccessToken();
  }
});

// 与主应用、Vue 子应用共用同一份 token key，便于演示共享登录态。
export function getReactMicroAccessToken() {
  return localStorage.getItem(REACT_MICRO_ACCESS_TOKEN_KEY);
}

export function setReactMicroAccessToken(token: string) {
  localStorage.setItem(REACT_MICRO_ACCESS_TOKEN_KEY, token);
}

export function clearReactMicroAccessToken() {
  localStorage.removeItem(REACT_MICRO_ACCESS_TOKEN_KEY);
}

// 供路由切换和页面离开时复用的统一取消入口。
export function cancelReactMicroRequests(reason = "React micro app route switched") {
  reactMicroHttp.cancelAllRequests(reason);
}
