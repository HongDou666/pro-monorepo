import axios, { AxiosError, AxiosHeaders, type AxiosHeaderValue, type AxiosResponse } from "axios";
import type {
  BusinessResponse,
  HttpInterceptorContext,
  HttpInterceptorOptions,
  InternalRequestConfig,
  ProAxiosInstance
} from "./types";

const configuredInstances = new WeakSet<object>();
const DEFAULT_UNAUTHORIZED_CODES = [401, "401"];
const DEFAULT_SUCCESS_CODES = [0, 200, "0", "200"];

/**
 * 为请求实例挂载统一的请求/响应拦截器。
 *
 * 设计目标：
 * 1. 公共包统一处理 token 注入
 * 2. 默认识别常见业务响应包结构
 * 3. 统一 HTTP 错误与业务错误提示
 * 4. 允许应用层通过回调覆盖细节，而不是复制一整套拦截器代码
 */
export function setupHttpInterceptors(client: ProAxiosInstance, options: HttpInterceptorOptions = {}) {
  if (configuredInstances.has(client.axios)) {
    return client;
  }

  configuredInstances.add(client.axios);

  client.axios.interceptors.request.use(config => {
    const typedConfig = config as InternalRequestConfig;
    const token = options.getToken?.();

    if (token && !typedConfig.interceptorOptions?.skipAuth && (options.shouldAttachToken?.(typedConfig) ?? true)) {
      const headers = cloneHeaders(config.headers);
      const tokenHeaderName = options.tokenHeaderName ?? "Authorization";

      if (!headers.has(tokenHeaderName)) {
        headers.set(tokenHeaderName, formatTokenValue(token, options.tokenPrefix));
      }

      config.headers = headers;
    }

    return config;
  });

  client.axios.interceptors.response.use(
    response => handleResponseSuccess(response, options),
    error => handleResponseError(error, options)
  );

  return client;
}

function handleResponseSuccess<T = unknown>(response: AxiosResponse<T>, options: HttpInterceptorOptions) {
  const typedConfig = response.config as InternalRequestConfig;

  if (typedConfig.interceptorOptions?.skipBusinessCheck) {
    return response;
  }

  const payload = response.data;

  if (!isBusinessResponse(payload, options)) {
    return response;
  }

  if (isBusinessSuccess(payload, options)) {
    if (
      (typedConfig.interceptorOptions?.unwrapBusinessData ?? options.unwrapBusinessData ?? true) &&
      "data" in payload
    ) {
      return {
        ...response,
        data: payload.data as T
      };
    }

    return response;
  }

  const errorMessage = resolveBusinessMessage(payload, options);
  const context: HttpInterceptorContext = {
    type: "business",
    config: typedConfig,
    payload,
    response
  };

  if (!typedConfig.interceptorOptions?.skipErrorToast) {
    options.showError?.(errorMessage, context);
  }

  if (isUnauthorizedBusinessResponse(payload, options)) {
    options.onUnauthorized?.(context);
  }

  return Promise.reject(new ProAxiosBusinessError(errorMessage, payload, response));
}

function handleResponseError(error: unknown, options: HttpInterceptorOptions) {
  if (!axios.isAxiosError(error)) {
    return Promise.reject(error);
  }

  if (error.code === AxiosError.ERR_CANCELED || error.message === "canceled") {
    return Promise.reject(error);
  }

  const typedConfig = error.config as InternalRequestConfig | undefined;
  const context: HttpInterceptorContext = {
    type: "http",
    config: typedConfig,
    error,
    response: error.response
  };

  if (!typedConfig?.interceptorOptions?.skipErrorToast) {
    const errorMessage = options.mapHttpErrorMessage?.(error) ?? defaultHttpErrorMessage(error);

    options.showError?.(errorMessage, context);
  }

  if (error.response?.status === 401) {
    options.onUnauthorized?.(context);
  }

  return Promise.reject(error);
}

function cloneHeaders(headers: InternalRequestConfig["headers"]) {
  const mergedHeaders = new AxiosHeaders();
  const iterableHeaders = headers as {
    forEach?: (callback: (value: AxiosHeaderValue, key: string) => void) => void;
  } | null;

  if (iterableHeaders && typeof iterableHeaders.forEach === "function") {
    iterableHeaders.forEach((value: AxiosHeaderValue, key: string) => {
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

  return mergedHeaders;
}

function formatTokenValue(token: string, tokenPrefix: HttpInterceptorOptions["tokenPrefix"]) {
  if (tokenPrefix === false) {
    return token;
  }

  const prefix = tokenPrefix ?? "Bearer";

  return `${prefix} ${token}`.trim();
}

function isBusinessResponse(payload: unknown, options: HttpInterceptorOptions): payload is BusinessResponse {
  if (options.isBusinessResponse) {
    return options.isBusinessResponse(payload);
  }

  return Boolean(payload && typeof payload === "object" && ("code" in payload || "success" in payload));
}

function isBusinessSuccess(payload: BusinessResponse, options: HttpInterceptorOptions) {
  if (options.isBusinessSuccess) {
    return options.isBusinessSuccess(payload);
  }

  if (typeof payload.success === "boolean") {
    return payload.success;
  }

  return payload.code === undefined || DEFAULT_SUCCESS_CODES.includes(payload.code);
}

function isUnauthorizedBusinessResponse(payload: BusinessResponse, options: HttpInterceptorOptions) {
  const unauthorizedCodes = options.unauthorizedCodes ?? DEFAULT_UNAUTHORIZED_CODES;

  return payload.code !== undefined && unauthorizedCodes.includes(payload.code);
}

function resolveBusinessMessage(payload: BusinessResponse, options: HttpInterceptorOptions) {
  return options.getBusinessMessage?.(payload) ?? payload.message ?? payload.msg ?? "业务请求失败";
}

function defaultHttpErrorMessage(error: AxiosError) {
  if (error.code === AxiosError.ERR_NETWORK) {
    return "网络异常，请检查网络连接";
  }

  if (error.code === AxiosError.ECONNABORTED) {
    return "请求超时，请稍后重试";
  }

  const status = error.response?.status;

  if (status === 401) {
    return "登录状态已失效，请重新登录";
  }

  if (status === 403) {
    return "当前账号无权访问该资源";
  }

  if (status === 404) {
    return "请求资源不存在";
  }

  if (typeof status === "number" && status >= 500) {
    return "服务异常，请稍后重试";
  }

  return error.message || "请求失败，请稍后重试";
}

function isHeaderValue(value: unknown): value is string | number | boolean | string[] {
  return (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    (Array.isArray(value) && value.every(item => typeof item === "string"))
  );
}

class ProAxiosBusinessError<T = unknown> extends Error {
  readonly code: BusinessResponse<T>["code"];
  readonly payload: BusinessResponse<T>;
  readonly response: AxiosResponse;
  readonly isBusinessError = true;

  constructor(message: string, payload: BusinessResponse<T>, response: AxiosResponse) {
    super(message);
    this.name = "ProAxiosBusinessError";
    this.code = payload.code;
    this.payload = payload;
    this.response = response;
  }
}
