import type { InternalRequestConfig } from "@pro-monorepo/axios";
import { mainHttp } from "./http";

/**
 * 主应用 demo 接口的响应结构。
 *
 * 这里使用本地 mock json，所以字段比较简单，主要用于验证：
 * 1. mainHttp 是否能正常发起请求。
 * 2. 请求缓存是否生效。
 * 3. 调用方能否正确获得类型推断。
 */
export interface MainHttpDemoResponse {
  app: string;
  message: string;
  features: string[];
  timestamp: string;
}

/**
 * 主应用请求示例。
 * 使用本地静态资源即可验证公共请求包接入是否正常，无需依赖后端环境。
 *
 * 参数说明：
 * - config 为可选的 axios 扩展配置。
 * - 你可以通过它覆盖缓存、重试、并发控制、headers 等行为。
 *
 * 常见示例：
 * - 关闭缓存：runtimeOptions.cache = false
 * - 跳过鉴权：interceptorOptions.skipAuth = true
 * - 关闭错误提示：interceptorOptions.skipErrorToast = true
 */
export function fetchMainHttpDemo(config?: InternalRequestConfig) {
  return mainHttp.get<MainHttpDemoResponse>("/mock/http-demo.json", config);
}

/**
 * 获取当前主应用请求实例中的缓存 key 列表。
 *
 * 这个函数主要用于调试和演示：
 * - 验证同一个 GET 请求是否命中缓存
 * - 观察当前缓存池里保存了哪些请求签名
 */
export function getMainHttpCacheKeys() {
  return mainHttp.getCacheKeys();
}

/**
 * 获取当前主应用请求实例中的待处理请求数量。
 *
 * 返回值包含：
 * - 正在执行中的请求
 * - 因并发上限进入等待队列的请求
 *
 * 适合用于调试并发控制是否符合预期。
 */
export function getMainPendingRequestCount() {
  return mainHttp.getPendingCount();
}
