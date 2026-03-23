import { createHttpClient, setupHttpInterceptors } from "@pro-monorepo/axios";
import { message } from "antd";

const REACT_MICRO_ACCESS_TOKEN_KEY = "pro-monorepo:access-token";

/**
 * React 子应用请求实例。
 *
 * 这里保持与 Vue 子应用相近的策略，便于不同子应用共享同一套网络治理约定。
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

setupHttpInterceptors(reactMicroHttp, {
  getToken: () => getReactMicroAccessToken(),
  showError: (errorMessage: string) => {
    void message.error(errorMessage);
  },
  onUnauthorized: () => {
    clearReactMicroAccessToken();
  }
});

export function getReactMicroAccessToken() {
  return localStorage.getItem(REACT_MICRO_ACCESS_TOKEN_KEY);
}

export function setReactMicroAccessToken(token: string) {
  localStorage.setItem(REACT_MICRO_ACCESS_TOKEN_KEY, token);
}

export function clearReactMicroAccessToken() {
  localStorage.removeItem(REACT_MICRO_ACCESS_TOKEN_KEY);
}

export function cancelReactMicroRequests(reason = "React micro app route switched") {
  reactMicroHttp.cancelAllRequests(reason);
}
