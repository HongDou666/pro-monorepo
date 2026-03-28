import type { InternalRequestConfig } from "@pro-monorepo/axios";
import { appendMockScopeToParams, HTTP_DEMO_API_PATH, MOCK_APP_SCOPE } from "@pro-monorepo/mock";
import { reactMicroHttp } from "./http";

/**
 * React 子应用演示接口返回结构。
 *
 * 用于请求演示页展示，不依赖真实后端，重点是验证共享请求库接入方式。
 */
export interface ReactMicroHttpDemoResponse {
  app: string;
  message: string;
  features: string[];
  timestamp: string;
}

// 通过共享 Mock.js 接口演示 get 请求、类型推断和运行时配置覆盖。
export function fetchReactMicroHttpDemo(config?: InternalRequestConfig) {
  return reactMicroHttp.get<ReactMicroHttpDemoResponse>(HTTP_DEMO_API_PATH, {
    ...config,
    params: appendMockScopeToParams(MOCK_APP_SCOPE.QIANKUN_APP_REACT, config?.params)
  });
}

// 仅用于演示和调试，帮助观察缓存层是否按预期工作。
export function getReactMicroHttpCacheKeys() {
  return reactMicroHttp.getCacheKeys();
}

// 包含执行中与等待中的请求数量。
export function getReactMicroPendingRequestCount() {
  return reactMicroHttp.getPendingCount();
}
