import type { InternalRequestConfig } from "@pro-monorepo/axios";
import { vueMicroHttp } from "./http";

/**
 * Vue 子应用演示接口返回结构。
 *
 * 这里故意保持简单，只用于演示共享请求实例的接入姿势与调试能力。
 */
export interface VueMicroHttpDemoResponse {
  app: string;
  message: string;
  features: string[];
  timestamp: string;
}

// 通过本地 mock 资源验证请求实例、缓存和类型推断是否工作正常。
export function fetchVueMicroHttpDemo(config?: InternalRequestConfig) {
  return vueMicroHttp.get<VueMicroHttpDemoResponse>("/mock/http-demo.json", config);
}

// 暴露缓存 key 主要服务于演示页和调试，不建议业务逻辑强依赖具体 key 结构。
export function getVueMicroHttpCacheKeys() {
  return vueMicroHttp.getCacheKeys();
}

// 返回值同时包含正在执行和处于等待队列中的请求。
export function getVueMicroPendingRequestCount() {
  return vueMicroHttp.getPendingCount();
}
