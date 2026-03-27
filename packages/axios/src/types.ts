import type {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  RawAxiosRequestHeaders
} from "axios";

/**
 * 请求库对外暴露的核心类型定义。
 *
 * 这些类型尽量围绕“使用者怎么配置”和“拦截器如何扩展”来组织，
 * 避免直接把 axios 内部细节暴露给业务层。
 */
export type HttpMethod = NonNullable<AxiosRequestConfig["method"]>;

export interface CacheStoreRecord {
  // 绝对过期时间戳，命中时需要先校验而不是盲读缓存。
  expiresAt: number;
  response: AxiosResponse;
}

export interface CacheStore {
  // 最小存储接口，方便未来接入 memory、indexedDB 或自定义 store。
  get(key: string): CacheStoreRecord | undefined;
  set(key: string, value: CacheStoreRecord): void;
  delete(key: string): void;
  clear(): void;
  keys(): string[];
}

export interface RetryContext {
  // 当前 attempt 从 1 开始计数，便于直接用于提示和退避计算。
  attempt: number;
  error: AxiosError;
  config: InternalRequestConfig;
}

export interface RetryOptions {
  // retries 表示失败后的最大补偿次数，不含首次请求。
  retries?: number;
  retryDelay?: number | ((context: RetryContext) => number);
  retryMethods?: HttpMethod[];
  shouldRetry?: (context: RetryContext) => boolean;
}

export interface ConcurrencyOptions {
  // enabled 允许实例默认开启，而在单次请求时按需关闭。
  enabled?: boolean;
  maxConcurrent?: number;
}

export interface CacheOptions {
  // methods 只对幂等请求启用更安全，默认仅缓存 get/head。
  enabled?: boolean;
  ttl?: number;
  methods?: HttpMethod[];
  store?: CacheStore;
  generateKey?: (config: InternalRequestConfig) => string;
}

export interface ProAxiosOptions {
  // 将 axios 原生配置与扩展能力分层，降低配置心智负担。
  axiosConfig?: AxiosRequestConfig;
  concurrency?: ConcurrencyOptions;
  retry?: RetryOptions;
  cache?: CacheOptions;
}

export interface BusinessResponse<T = unknown> {
  // 兼容常见后端包结构：code/message/msg/data/success。
  code?: number | string;
  success?: boolean;
  message?: string;
  msg?: string;
  data?: T;
  [key: string]: unknown;
}

export interface InterceptorRequestOptions {
  // 以下开关都按“单次请求粒度”生效，用于覆盖全局拦截器默认行为。
  skipAuth?: boolean;
  skipBusinessCheck?: boolean;
  skipErrorToast?: boolean;
  unwrapBusinessData?: boolean;
}

export interface HttpInterceptorContext {
  // context 统一给错误提示、未授权处理和业务扩展复用。
  type: "business" | "http";
  config?: InternalRequestConfig;
  payload?: BusinessResponse;
  response?: AxiosResponse;
  error?: AxiosError;
}

export interface HttpInterceptorOptions {
  // 这里聚合的是“应用层常见横切能力”，例如 token、错误提示和业务码判断。
  getToken?: () => string | null | undefined;
  tokenHeaderName?: string;
  tokenPrefix?: string | false;
  shouldAttachToken?: (config: InternalRequestConfig) => boolean;
  isBusinessResponse?: (payload: unknown) => payload is BusinessResponse;
  isBusinessSuccess?: (payload: BusinessResponse) => boolean;
  getBusinessMessage?: (payload: BusinessResponse) => string;
  unauthorizedCodes?: Array<number | string>;
  unwrapBusinessData?: boolean;
  showError?: (message: string, context: HttpInterceptorContext) => void;
  onUnauthorized?: (context: HttpInterceptorContext) => void;
  mapHttpErrorMessage?: (error: AxiosError) => string;
}

export interface RequestRuntimeOptions {
  // false 明确表示禁用某项能力，而不是“使用默认值”。
  retry?: false | Partial<RetryOptions>;
  cache?: false | Partial<CacheOptions>;
  concurrency?: false | Partial<ConcurrencyOptions>;
  requestId?: string;
}

export interface InternalRequestConfig<D = unknown> extends AxiosRequestConfig<D> {
  // runtimeOptions 控制本次请求运行策略，interceptorOptions 控制拦截器行为。
  runtimeOptions?: RequestRuntimeOptions;
  interceptorOptions?: InterceptorRequestOptions;
}

export interface RequestMeta {
  // requestId 用于链路追踪，signal 用于统一中断控制。
  requestId: string;
  signal: AbortSignal;
}

export interface ProAxiosInstance {
  // 直接暴露 axios 实例，允许在不破坏封装前提下接入更底层能力。
  readonly axios: AxiosInstance;
  request<T = unknown, D = unknown>(config: InternalRequestConfig<D>): Promise<AxiosResponse<T, D>>;
  get<T = unknown>(url: string, config?: InternalRequestConfig): Promise<AxiosResponse<T>>;
  delete<T = unknown>(url: string, config?: InternalRequestConfig): Promise<AxiosResponse<T>>;
  head<T = unknown>(url: string, config?: InternalRequestConfig): Promise<AxiosResponse<T>>;
  options<T = unknown>(url: string, config?: InternalRequestConfig): Promise<AxiosResponse<T>>;
  post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: InternalRequestConfig<D>
  ): Promise<AxiosResponse<T, D>>;
  put<T = unknown, D = unknown>(url: string, data?: D, config?: InternalRequestConfig<D>): Promise<AxiosResponse<T, D>>;
  patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: InternalRequestConfig<D>
  ): Promise<AxiosResponse<T, D>>;
  cancelAllRequests(reason?: string): void;
  clearCache(): void;
  deleteCache(configOrKey: string | InternalRequestConfig): void;
  getPendingCount(): number;
  getCacheKeys(): string[];
}

export interface ResolvedRetryOptions {
  retries: number;
  retryDelay: NonNullable<RetryOptions["retryDelay"]>;
  retryMethods: HttpMethod[];
  shouldRetry?: RetryOptions["shouldRetry"];
}

export interface ResolvedConcurrencyOptions {
  enabled: boolean;
  maxConcurrent: number;
}

export interface ResolvedCacheOptions {
  enabled: boolean;
  ttl: number;
  methods: HttpMethod[];
  store: CacheStore;
  generateKey: (config: InternalRequestConfig) => string;
}

export interface ResolvedProAxiosOptions {
  axiosConfig: AxiosRequestConfig;
  concurrency: ResolvedConcurrencyOptions;
  retry: ResolvedRetryOptions;
  cache: ResolvedCacheOptions;
}

export type AxiosRequestHeadersLike = RawAxiosRequestHeaders | AxiosHeaders | HeadersDefaults;
