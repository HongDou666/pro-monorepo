/**
 * 统一的演示接口地址。
 *
 * 这里不再暴露静态 json 文件路径，而是模拟真实后端接口地址，
 * 这样主应用和所有子应用都能按“请求 API”的方式接入 mock 能力。
 */
export const HTTP_DEMO_API_PATH = "/api/demo/http";

/**
 * 不同前端运行单元的逻辑标识。
 *
 * 所有应用都请求同一个接口地址，但会通过 query 参数带上自己的 scope，
 * mock 层再根据 scope 返回各自的演示文案，避免多个子应用同时运行时发生冲突。
 */
export const MOCK_APP_SCOPE = {
  MAIN_APP: "main-app",
  MICRO_APP_REACT: "micro-app-react",
  MICRO_APP_VUE: "micro-app-vue",
  QIANKUN_APP_REACT: "qiankun-app-react",
  QIANKUN_APP_VUE: "qiankun-app-vue"
} as const;

export type MockAppScope = (typeof MOCK_APP_SCOPE)[keyof typeof MOCK_APP_SCOPE];

const MOCK_APP_SCOPE_VALUES = Object.values(MOCK_APP_SCOPE) as MockAppScope[];

interface HttpDemoPreset {
  app: string;
  message: string;
}

const HTTP_DEMO_FEATURES = ["并发控制", "批量取消", "失败重试", "请求缓存"];

const HTTP_DEMO_PRESETS: Record<MockAppScope, HttpDemoPreset> = {
  [MOCK_APP_SCOPE.MAIN_APP]: {
    app: "main-app",
    message: "主应用已经接入 @pro-monorepo/axios 公共请求实例"
  },
  [MOCK_APP_SCOPE.MICRO_APP_REACT]: {
    app: "vite-react",
    message: "React 子应用已经接入 @pro-monorepo/axios 公共请求实例"
  },
  [MOCK_APP_SCOPE.MICRO_APP_VUE]: {
    app: "vite-vue",
    message: "Vue 子应用已经接入 @pro-monorepo/axios 公共请求实例"
  },
  [MOCK_APP_SCOPE.QIANKUN_APP_REACT]: {
    app: "qiankun-vite-react",
    message: "qiankun React 子应用已经接入 @pro-monorepo/axios 公共请求实例"
  },
  [MOCK_APP_SCOPE.QIANKUN_APP_VUE]: {
    app: "qiankun-vite-vue",
    message: "qiankun Vue 子应用已经接入 @pro-monorepo/axios 公共请求实例"
  }
};

/**
 * 统一返回演示接口的响应结构。
 */
export interface HttpDemoResponse {
  app: string;
  message: string;
  features: string[];
  timestamp: string;
}

function createRequestUrl(url: string) {
  const base = typeof window === "undefined" ? "http://localhost" : window.location.origin;

  return new URL(url, base);
}

function normalizeParams(params?: unknown) {
  if (params instanceof URLSearchParams) {
    return Object.fromEntries(params.entries());
  }

  if (typeof params === "object" && params !== null && !Array.isArray(params)) {
    return params as Record<string, unknown>;
  }

  return {};
}

/**
 * 运行时判断一个字符串是否为合法的 scope。
 */
export function isMockAppScope(value: string | null | undefined): value is MockAppScope {
  return Boolean(value && MOCK_APP_SCOPE_VALUES.includes(value as MockAppScope));
}

/**
 * 从请求地址中解析出当前请求来自哪个应用。
 *
 * 之所以从 URL query 中取值，而不是把接口拆成 5 个路径，
 * 是为了既保留统一 API 入口，又避免多个微前端同时挂载时的 mock 冲突。
 */
export function resolveHttpDemoScope(url: string) {
  const scope = createRequestUrl(url).searchParams.get("appScope");

  return isMockAppScope(scope) ? scope : MOCK_APP_SCOPE.MAIN_APP;
}

/**
 * 根据不同 scope 生成对应的响应体。
 */
export function createHttpDemoResponse(scope: MockAppScope): HttpDemoResponse {
  const preset = HTTP_DEMO_PRESETS[scope];

  return {
    app: preset.app,
    message: preset.message,
    features: [...HTTP_DEMO_FEATURES],
    timestamp: new Date().toISOString()
  };
}

/**
 * 把 appScope 合并进现有 params。
 *
 * 这个工具函数专门给各个 demo API 文件使用，
 * 让调用方保留原有自定义 params 的同时，稳定带上 mock 分流所需的 scope 信息。
 */
export function appendMockScopeToParams(scope: MockAppScope, params?: unknown) {
  return {
    appScope: scope,
    ...normalizeParams(params)
  };
}
