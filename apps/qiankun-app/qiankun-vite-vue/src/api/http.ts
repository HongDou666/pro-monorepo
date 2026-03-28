import { createHttpClient, setupHttpInterceptors } from "@pro-monorepo/axios";
import { message } from "ant-design-vue";

const VUE_MICRO_ACCESS_TOKEN_KEY = "pro-monorepo:access-token";

/**
 * Vue 子应用请求实例。
 *
 * 子应用通常按自己的部署路径走相对地址，因此 baseURL 保持为 /。
 * 这里附加 x-micro-app 头，方便未来网关或日志平台识别来源。
 * 同时沿用公共请求包里的并发控制、失败重试和缓存能力，
 * 让子应用网络治理策略与主应用保持一致。
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

/**
 * 接入子应用通用拦截逻辑。
 *
 * 这里收口 token 注入、错误提示和 401 清理，
 * 页面层就不需要重复处理这些横切逻辑。
 */
setupHttpInterceptors(vueMicroHttp, {
  getToken: () => getVueMicroAccessToken(),
  showError: (errorMessage: string) => {
    void message.error(errorMessage);
  },
  onUnauthorized: () => {
    clearVueMicroAccessToken();
  }
});

// 与主应用共用同一份 token key，方便主子应用共享登录态演示。
export function getVueMicroAccessToken() {
  return localStorage.getItem(VUE_MICRO_ACCESS_TOKEN_KEY);
}

export function setVueMicroAccessToken(token: string) {
  localStorage.setItem(VUE_MICRO_ACCESS_TOKEN_KEY, token);
}

export function clearVueMicroAccessToken() {
  localStorage.removeItem(VUE_MICRO_ACCESS_TOKEN_KEY);
}

// 路由切换或页面卸载时可统一调用，取消该实例下所有未完成请求。
export function cancelVueMicroRequests(reason = "Vue micro app route switched") {
  vueMicroHttp.cancelAllRequests(reason);
}
