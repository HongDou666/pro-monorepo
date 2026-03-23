import type {
  AxiosError,
  AxiosHeaders,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  RawAxiosRequestHeaders
} from "axios";

export type HttpMethod = NonNullable<AxiosRequestConfig["method"]>;

export interface CacheStoreRecord {
  expiresAt: number;
  response: AxiosResponse;
}

export interface CacheStore {
  get(key: string): CacheStoreRecord | undefined;
  set(key: string, value: CacheStoreRecord): void;
  delete(key: string): void;
  clear(): void;
  keys(): string[];
}

export interface RetryContext {
  attempt: number;
  error: AxiosError;
  config: InternalRequestConfig;
}

export interface RetryOptions {
  retries?: number;
  retryDelay?: number | ((context: RetryContext) => number);
  retryMethods?: HttpMethod[];
  shouldRetry?: (context: RetryContext) => boolean;
}

export interface ConcurrencyOptions {
  enabled?: boolean;
  maxConcurrent?: number;
}

export interface CacheOptions {
  enabled?: boolean;
  ttl?: number;
  methods?: HttpMethod[];
  store?: CacheStore;
  generateKey?: (config: InternalRequestConfig) => string;
}

export interface ProAxiosOptions {
  axiosConfig?: AxiosRequestConfig;
  concurrency?: ConcurrencyOptions;
  retry?: RetryOptions;
  cache?: CacheOptions;
}

export interface BusinessResponse<T = unknown> {
  code?: number | string;
  success?: boolean;
  message?: string;
  msg?: string;
  data?: T;
  [key: string]: unknown;
}

export interface InterceptorRequestOptions {
  skipAuth?: boolean;
  skipBusinessCheck?: boolean;
  skipErrorToast?: boolean;
  unwrapBusinessData?: boolean;
}

export interface HttpInterceptorContext {
  type: "business" | "http";
  config?: InternalRequestConfig;
  payload?: BusinessResponse;
  response?: AxiosResponse;
  error?: AxiosError;
}

export interface HttpInterceptorOptions {
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
  retry?: false | Partial<RetryOptions>;
  cache?: false | Partial<CacheOptions>;
  concurrency?: false | Partial<ConcurrencyOptions>;
  requestId?: string;
}

export interface InternalRequestConfig<D = unknown> extends AxiosRequestConfig<D> {
  runtimeOptions?: RequestRuntimeOptions;
  interceptorOptions?: InterceptorRequestOptions;
}

export interface RequestMeta {
  requestId: string;
  signal: AbortSignal;
}

export interface ProAxiosInstance {
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
