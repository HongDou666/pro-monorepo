import type { InternalRequestConfig } from "@pro-monorepo/axios";
import { vueMicroHttp } from "./http";

export interface VueMicroHttpDemoResponse {
  app: string;
  message: string;
  features: string[];
  timestamp: string;
}

export function fetchVueMicroHttpDemo(config?: InternalRequestConfig) {
  return vueMicroHttp.get<VueMicroHttpDemoResponse>("/mock/http-demo.json", config);
}

export function getVueMicroHttpCacheKeys() {
  return vueMicroHttp.getCacheKeys();
}

export function getVueMicroPendingRequestCount() {
  return vueMicroHttp.getPendingCount();
}
