import type { AxiosResponse } from "axios";
import type { CacheStore, CacheStoreRecord, InternalRequestConfig } from "./types";

/**
 * 默认内存缓存实现。
 * 适合浏览器场景的轻量缓存，不依赖 localStorage，避免序列化响应对象的额外开销。
 */
export class MemoryCacheStore implements CacheStore {
  private readonly store = new Map<string, CacheStoreRecord>();

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
 * 清理过期缓存，命中时返回响应副本，避免外部代码直接修改缓存对象。
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
 */
export function writeCache(store: CacheStore, key: string, response: AxiosResponse, ttl: number) {
  store.set(key, {
    expiresAt: Date.now() + ttl,
    response: cloneResponse(response)
  });
}

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
