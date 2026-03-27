import type { AxiosResponse } from "axios";
import type { CacheStore, CacheStoreRecord, InternalRequestConfig } from "./types";

/**
 * 默认内存缓存实现。
 * 适合浏览器场景的轻量缓存，不依赖 localStorage，避免序列化响应对象的额外开销。
 */
export class MemoryCacheStore implements CacheStore {
  private readonly store = new Map<string, CacheStoreRecord>();

  // 直接暴露最小 CRUD 接口，便于未来替换为自定义存储实现。
  get(key: string) {
    return this.store.get(key);
  }

  set(key: string, value: CacheStoreRecord) {
    this.store.set(key, value);
  }

  delete(key: string) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }

  keys() {
    return [...this.store.keys()];
  }
}

/**
 * 统一序列化对象，保证同一份参数生成稳定 key。
 *
 * 这里不直接使用 JSON.stringify 的原因是对象 key 顺序可能不稳定，
 * 导致语义相同的 params/data 生成不同缓存签名。
 */
function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(item => stableStringify(item)).join(",")}]`;
  }

  const objectValue = value as Record<string, unknown>;
  const keys = Object.keys(objectValue).sort();

  return `{${keys.map(key => `${JSON.stringify(key)}:${stableStringify(objectValue[key])}`).join(",")}}`;
}

/**
 * 生成缓存 key，默认会将 method、url、params、data、baseURL 纳入签名。
 *
 * 这样可以覆盖大多数 GET/HEAD 场景，避免仅凭 url 缓存导致不同查询参数互相污染。
 */
export function defaultCacheKeyGenerator(config: InternalRequestConfig) {
  return stableStringify({
    method: (config.method ?? "get").toLowerCase(),
    baseURL: config.baseURL ?? "",
    url: config.url ?? "",
    params: config.params ?? null,
    data: config.data ?? null
  });
}

/**
 * 读取缓存。
 *
 * 读取时会顺带做两件事：
 * 1. 检查是否过期，过期则立即清理。
 * 2. 返回响应副本，避免调用方意外改坏缓存中的原始对象。
 */
export function readCache(store: CacheStore, key: string): AxiosResponse | undefined {
  const record = store.get(key);

  if (!record) {
    return undefined;
  }

  if (record.expiresAt <= Date.now()) {
    store.delete(key);

    return undefined;
  }

  return cloneResponse(record.response);
}

/**
 * 将响应写入缓存。
 *
 * 缓存时同样先做 clone，确保后续业务层修改 response.data 不会反向污染缓存池。
 */
export function writeCache(store: CacheStore, key: string, response: AxiosResponse, ttl: number) {
  store.set(key, {
    expiresAt: Date.now() + ttl,
    response: cloneResponse(response)
  });
}

/**
 * 深拷贝 axios 响应对象中常见的可变字段。
 *
 * 这里重点处理 data、headers 和 config.headers，已经足够覆盖缓存读写的主要风险点。
 */
function cloneResponse<T = unknown>(response: AxiosResponse<T>): AxiosResponse<T> {
  return {
    ...response,
    data: cloneValue(response.data),
    headers: cloneValue(response.headers),
    config: {
      ...response.config,
      headers: cloneValue(response.config.headers)
    }
  };
}

/**
 * 对任意可序列化值做副本复制。
 *
 * 优先使用 structuredClone，回退到 JSON 方案；
 * 若值本身不可序列化，则退回原值，避免因缓存辅助逻辑打断主流程。
 */
function cloneValue<T>(value: T): T {
  if (typeof globalThis.structuredClone === "function") {
    return globalThis.structuredClone(value);
  }

  if (value === null || value === undefined) {
    return value;
  }

  try {
    return JSON.parse(JSON.stringify(value)) as T;
  } catch {
    return value;
  }
}
