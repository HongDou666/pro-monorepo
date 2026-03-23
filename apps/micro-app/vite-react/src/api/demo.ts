import type { InternalRequestConfig } from "@pro-monorepo/axios";
import { reactMicroHttp } from "./http";

export interface ReactMicroHttpDemoResponse {
  app: string;
  message: string;
  features: string[];
  timestamp: string;
}

export function fetchReactMicroHttpDemo(config?: InternalRequestConfig) {
  return reactMicroHttp.get<ReactMicroHttpDemoResponse>("/mock/http-demo.json", config);
}

export function getReactMicroHttpCacheKeys() {
  return reactMicroHttp.getCacheKeys();
}

export function getReactMicroPendingRequestCount() {
  return reactMicroHttp.getPendingCount();
}
