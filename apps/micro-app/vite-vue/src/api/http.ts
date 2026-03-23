import { createHttpClient, setupHttpInterceptors } from "@pro-monorepo/axios";
import { message } from "ant-design-vue";

const VUE_MICRO_ACCESS_TOKEN_KEY = "pro-monorepo:access-token";

/**
 * Vue 子应用请求实例。
 *
 * 子应用通常按自己的部署路径走相对地址，因此 baseURL 保持为 /。
 * 这里附加 x-micro-app 头，方便未来网关或日志平台识别来源。
 */
export const vueMicroHttp = createHttpClient({
  axiosConfig: {
    baseURL: "/",
    timeout: 8_000,
    headers: {
      "x-micro-app": "vite-vue"
    }
  },
  concurrency: {
    maxConcurrent: 4
  },
  retry: {
    retries: 2, // 重试次数
    retryDelay: ({ attempt }) => attempt * 300 // 重试延迟，随重试次数递增
  },
  cache: {
    enabled: true, // 启用缓存
    ttl: 10_000 // 缓存时间，单位毫秒
  }
});

setupHttpInterceptors(vueMicroHttp, {
  getToken: () => getVueMicroAccessToken(),
  showError: (errorMessage: string) => {
    void message.error(errorMessage);
  },
  onUnauthorized: () => {
    clearVueMicroAccessToken();
  }
});

export function getVueMicroAccessToken() {
  return localStorage.getItem(VUE_MICRO_ACCESS_TOKEN_KEY);
}

export function setVueMicroAccessToken(token: string) {
  localStorage.setItem(VUE_MICRO_ACCESS_TOKEN_KEY, token);
}

export function clearVueMicroAccessToken() {
  localStorage.removeItem(VUE_MICRO_ACCESS_TOKEN_KEY);
}

export function cancelVueMicroRequests(reason = "Vue micro app route switched") {
  vueMicroHttp.cancelAllRequests(reason);
}
