/**
 * @pro-monorepo/axios
 * 基于 axios 的公共请求库。
 *
 * 提供以下能力：
 * 1. 统一创建请求实例
 * 2. 并发控制
 * 3. 批量取消未完成请求
 * 4. 请求失败自动重试
 * 5. GET/HEAD 等请求缓存
 */
import axios, {
  AxiosError,
  type AxiosHeaderValue,
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosResponse,
  type GenericAbortSignal
} from "axios";
import { MemoryCacheStore, defaultCacheKeyGenerator, readCache, writeCache } from "./cache";
import { RequestConcurrencyController } from "./concurrency";
import { setupHttpInterceptors } from "./interceptors";
import type {
  CacheOptions,
  ConcurrencyOptions,
  InternalRequestConfig,
  ProAxiosInstance,
  ProAxiosOptions,
  RequestMeta,
  RequestRuntimeOptions,
  ResolvedCacheOptions,
  ResolvedConcurrencyOptions,
  ResolvedProAxiosOptions,
  ResolvedRetryOptions,
  RetryOptions
} from "./types";

const DEFAULT_RETRY_METHODS = ["get", "head", "options"];
const DEFAULT_CACHE_METHODS = ["get", "head"];

/**
 * 创建公共请求实例。
 */
export function createHttpClient(options: ProAxiosOptions = {}): ProAxiosInstance {
  const resolvedOptions = resolveOptions(options);
  const axiosInstance = axios.create(resolvedOptions.axiosConfig);
  const concurrencyController = new RequestConcurrencyController(resolvedOptions.concurrency.maxConcurrent);
  const controllers = new Map<string, AbortController>();

  /**
   * 请求总入口。
   *
   * 执行顺序固定为：
   * 1. 生成 requestId 与中断控制器。
   * 2. 合并运行时配置与实例默认配置。
   * 3. 优先尝试读取缓存，命中后直接返回。
   * 4. 如启用并发控制，则先进入并发队列。
   * 5. 发起真实请求并按策略重试。
   * 6. 成功响应按需写入缓存。
   * 7. 无论成功失败都清理 requestId 关联的控制器。
   */
  async function request<T = unknown, D = unknown>(config: InternalRequestConfig<D>) {
    const requestId = config.runtimeOptions?.requestId ?? createRequestId();
    const controller = new AbortController();

    controllers.set(requestId, controller);

    const runtimeConfig = resolveRuntimeConfig(config.runtimeOptions, resolvedOptions);
    const mergedConfig = mergeConfigWithMeta(config, {
      requestId,
      signal: composeAbortSignal(controller.signal, config.signal)
    });

    try {
      const cachedResponse = getCachedResponse(mergedConfig, runtimeConfig.cache);

      if (cachedResponse) {
        return cachedResponse as AxiosResponse<T, D>;
      }

      if (runtimeConfig.concurrency.enabled) {
        await concurrencyController.acquire(mergedConfig.signal as AbortSignal);
      }

      try {
        const response = await executeWithRetry<T, D>(axiosInstance, mergedConfig, runtimeConfig.retry);

        if (shouldUseCache(mergedConfig, runtimeConfig.cache)) {
          const cacheKey = runtimeConfig.cache.generateKey(mergedConfig);

          writeCache(runtimeConfig.cache.store, cacheKey, response, runtimeConfig.cache.ttl);
        }

        return response;
      } finally {
        if (runtimeConfig.concurrency.enabled) {
          concurrencyController.release();
        }
      }
    } finally {
      controllers.delete(requestId);
    }
  }

  /**
   * 取消当前实例下所有未完成请求。
   *
   * 包含两类任务：
   * 1. 已经发出但尚未结束的请求。
   * 2. 因并发上限而仍在等待队列中的请求。
   */
  function cancelAllRequests(reason = "All unfinished requests have been canceled") {
    controllers.forEach(controller => controller.abort(reason));
    concurrencyController.cancelPending(reason);
    controllers.clear();
  }

  /**
   * 清空整个缓存池。
   *
   * 这是实例级别操作，适合登录态切换、租户切换或调试时使用。
   */
  function clearCache() {
    resolvedOptions.cache.store.clear();
  }

  /**
   * 按缓存 key 或请求配置删除单条缓存。
   *
   * 传入请求配置时会按照当前实例的 generateKey 规则计算 key，
   * 避免调用方手写 key 导致删除不一致。
   */
  function deleteCache(configOrKey: string | InternalRequestConfig) {
    const cacheKey = typeof configOrKey === "string" ? configOrKey : resolvedOptions.cache.generateKey(configOrKey);

    resolvedOptions.cache.store.delete(cacheKey);
  }

  return {
    axios: axiosInstance,
    request,
    get: (url, config) => request({ ...config, method: "get", url }),
    delete: (url, config) => request({ ...config, method: "delete", url }),
    head: (url, config) => request({ ...config, method: "head", url }),
    options: (url, config) => request({ ...config, method: "options", url }),
    post: (url, data, config) => request({ ...config, method: "post", url, data }),
    put: (url, data, config) => request({ ...config, method: "put", url, data }),
    patch: (url, data, config) => request({ ...config, method: "patch", url, data }),
    cancelAllRequests,
    clearCache,
    deleteCache,
    getPendingCount: () => concurrencyController.getPendingCount(),
    getCacheKeys: () => resolvedOptions.cache.store.keys()
  };
}

/**
 * 默认实例，适合简单场景直接使用。
 */
export const httpClient = createHttpClient();

export const request = httpClient.request;
export const get = httpClient.get;
export const post = httpClient.post;
export const put = httpClient.put;
export const patch = httpClient.patch;
export const del = httpClient.delete;
export const head = httpClient.head;
export const options = httpClient.options;
export const cancelAllRequests = httpClient.cancelAllRequests;
export const clearHttpCache = httpClient.clearCache;

export { AxiosError, AxiosHeaders, MemoryCacheStore, defaultCacheKeyGenerator, setupHttpInterceptors };

export type {
  BusinessResponse,
  CacheOptions,
  ConcurrencyOptions,
  HttpInterceptorContext,
  HttpInterceptorOptions,
  InternalRequestConfig,
  ProAxiosInstance,
  ProAxiosOptions,
  RequestRuntimeOptions,
  RetryOptions
} from "./types";

async function executeWithRetry<T = unknown, D = unknown>(
  axiosInstance: ReturnType<typeof axios.create>,
  config: InternalRequestConfig<D>,
  retryOptions: ResolvedRetryOptions
) {
  let attempt = 0;

  // 统一在这里处理重试，让 request 主流程保持线性可读。
  while (true) {
    try {
      return await axiosInstance.request<T, AxiosResponse<T, D>, D>(config);
    } catch (error) {
      if (!axios.isAxiosError(error)) {
        throw error;
      }

      const currentAttempt = attempt + 1;
      const retryContext = {
        attempt: currentAttempt,
        error,
        config
      };

      if (!shouldRetryRequest(retryContext, retryOptions)) {
        throw error;
      }

      attempt = currentAttempt;
      const delay =
        typeof retryOptions.retryDelay === "function" ? retryOptions.retryDelay(retryContext) : retryOptions.retryDelay;

      await wait(delay, config.signal as AbortSignal | undefined);
    }
  }
}

function shouldRetryRequest(
  context: {
    attempt: number;
    error: AxiosError;
    config: InternalRequestConfig;
  },
  retryOptions: ResolvedRetryOptions
) {
  // 是否重试由“次数、方法、取消状态、自定义判断”四层共同决定。
  const method = normalizeMethod(context.config.method);

  if (context.attempt > retryOptions.retries) {
    return false;
  }

  if (!retryOptions.retryMethods.includes(method)) {
    return false;
  }

  if (isCanceledError(context.error)) {
    return false;
  }

  if (retryOptions.shouldRetry) {
    return retryOptions.shouldRetry(context);
  }

  const status = context.error.response?.status;

  return typeof status !== "number" || status >= 500 || status === 408 || status === 429;
}

function getCachedResponse(config: InternalRequestConfig, cacheOptions: ResolvedCacheOptions) {
  if (!shouldUseCache(config, cacheOptions)) {
    return undefined;
  }

  const cacheKey = cacheOptions.generateKey(config);

  return readCache(cacheOptions.store, cacheKey);
}

function shouldUseCache(config: InternalRequestConfig, cacheOptions: ResolvedCacheOptions) {
  return cacheOptions.enabled && cacheOptions.methods.includes(normalizeMethod(config.method));
}

/**
 * 将用户传入的可选配置标准化为完整配置对象。
 *
 * 这样后续执行链只需要消费 resolvedOptions，避免每个阶段重复做空值判断。
 */
function resolveOptions(options: ProAxiosOptions): ResolvedProAxiosOptions {
  return {
    axiosConfig: options.axiosConfig ?? {},
    concurrency: resolveConcurrencyOptions(options.concurrency),
    retry: resolveRetryOptions(options.retry),
    cache: resolveCacheOptions(options.cache)
  };
}

/**
 * 将单次请求的运行时覆盖项合并到实例默认配置。
 *
 * 这里显式支持传入 false 关闭单项能力，便于业务按请求粒度禁用缓存、重试或并发控制。
 */
function resolveRuntimeConfig(runtimeOptions: RequestRuntimeOptions | undefined, options: ResolvedProAxiosOptions) {
  return {
    concurrency:
      runtimeOptions?.concurrency === false
        ? { ...options.concurrency, enabled: false }
        : {
            ...options.concurrency,
            ...(runtimeOptions?.concurrency ?? {})
          },
    retry:
      runtimeOptions?.retry === false
        ? { ...options.retry, retries: 0 }
        : {
            ...options.retry,
            ...(runtimeOptions?.retry ?? {})
          },
    cache:
      runtimeOptions?.cache === false
        ? { ...options.cache, enabled: false }
        : {
            ...options.cache,
            ...(runtimeOptions?.cache ?? {})
          }
  };
}

function resolveRetryOptions(options: RetryOptions | undefined): ResolvedRetryOptions {
  return {
    retries: options?.retries ?? 0,
    retryDelay: options?.retryDelay ?? 300,
    retryMethods: normalizeMethods(options?.retryMethods ?? DEFAULT_RETRY_METHODS),
    shouldRetry: options?.shouldRetry
  };
}

function resolveConcurrencyOptions(options: ConcurrencyOptions | undefined): ResolvedConcurrencyOptions {
  return {
    enabled: options?.enabled ?? true,
    maxConcurrent: Math.max(1, options?.maxConcurrent ?? Number.POSITIVE_INFINITY)
  };
}

function resolveCacheOptions(options: CacheOptions | undefined): ResolvedCacheOptions {
  return {
    enabled: options?.enabled ?? false,
    ttl: Math.max(0, options?.ttl ?? 10_000),
    methods: normalizeMethods(options?.methods ?? DEFAULT_CACHE_METHODS),
    store: options?.store ?? new MemoryCacheStore(),
    generateKey: options?.generateKey ?? defaultCacheKeyGenerator
  };
}

/**
 * 统一补齐请求元信息。
 *
 * 当前会规范化 method、合并请求头并保证 signal 一定可用，
 * 这样下游重试、缓存、并发控制都能依赖稳定字段工作。
 */
function mergeConfigWithMeta<D>(config: InternalRequestConfig<D>, meta: RequestMeta): InternalRequestConfig<D> {
  return {
    ...config,
    method: normalizeMethod(config.method),
    headers: mergeHeaders(config.headers, meta.requestId),
    signal: meta.signal
  };
}

/**
 * 将各种 headers 输入形态规整成 AxiosHeaders，并注入 x-request-id。
 *
 * x-request-id 可用于网关追踪、日志检索和跨服务链路排查。
 */
function mergeHeaders(headers: AxiosRequestConfig["headers"], requestId: string) {
  const mergedHeaders = new AxiosHeaders();

  if (headers instanceof AxiosHeaders) {
    headers.forEach((value: AxiosHeaderValue, key: string) => {
      if (typeof value !== "undefined") {
        mergedHeaders.set(key, value);
      }
    });
  } else if (headers && typeof headers === "object") {
    Object.entries(headers).forEach(([key, value]) => {
      if (isHeaderValue(value)) {
        mergedHeaders.set(key, value);
      }
    });
  }

  if (!mergedHeaders.has("x-request-id")) {
    mergedHeaders.set("x-request-id", requestId);
  }

  return mergedHeaders;
}

/**
 * 组合内部 controller 与调用方传入的 signal。
 *
 * 目标是保证“任一来源取消都能终止请求”：
 * - 实例批量取消
 * - 调用方主动取消
 * - 并发等待期间取消
 */
function composeAbortSignal(signalA: AbortSignal, signalB?: GenericAbortSignal) {
  if (!signalB) {
    return signalA;
  }

  const normalizedSignalB = toAbortSignal(signalB);

  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any([signalA, normalizedSignalB]);
  }

  const controller = new AbortController();
  const abort = (reason?: unknown) => controller.abort(reason);

  if (signalA.aborted) {
    abort(signalA.reason);

    return controller.signal;
  }

  if (normalizedSignalB.aborted) {
    abort(normalizedSignalB.reason);

    return controller.signal;
  }

  signalA.addEventListener("abort", () => abort(signalA.reason), { once: true });
  normalizedSignalB.addEventListener("abort", () => abort(normalizedSignalB.reason), { once: true });

  return controller.signal;
}

/**
 * 将 axios 兼容的 GenericAbortSignal 兜底转换为标准 AbortSignal。
 *
 * 某些运行环境只暴露最小事件接口，因此这里做一次兼容层收口。
 */
function toAbortSignal(signal: GenericAbortSignal) {
  if (signal instanceof AbortSignal) {
    return signal;
  }

  const controller = new AbortController();
  const abort = () => controller.abort("Request aborted");

  if (signal.aborted) {
    abort();

    return controller.signal;
  }

  if (typeof signal.addEventListener === "function") {
    signal.addEventListener("abort", abort, { once: true });
  }

  return controller.signal;
}

function normalizeMethods(methods: string[]) {
  return methods.map(method => method.toLowerCase());
}

function normalizeMethod(method?: string) {
  return (method ?? "get").toLowerCase();
}

function isHeaderValue(value: unknown): value is string | number | boolean | string[] {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    (Array.isArray(value) && value.every(item => typeof item === "string"))
  );
}

// requestId 保持可读而非追求强随机，主要用于排障和日志串联。
function createRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function isCanceledError(error: AxiosError) {
  return error.code === AxiosError.ERR_CANCELED || error.message === "canceled";
}

function wait(ms: number, signal?: AbortSignal) {
  if (ms <= 0) {
    return Promise.resolve();
  }

  // 重试等待阶段也响应取消，避免页面离开后仍继续排队重试。
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    const onAbort = () => {
      clearTimeout(timer);
      reject(new AxiosError("Request retry has been canceled", AxiosError.ERR_CANCELED));
    };

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
