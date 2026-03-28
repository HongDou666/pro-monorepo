import Mock from "mockjs";
import {
  createHttpDemoResponse,
  HTTP_DEMO_API_PATH,
  resolveHttpDemoScope,
  type MockAppScope
} from "../shared/http-demo";

interface ProMonorepoMockState {
  initialized: boolean;
}

const MOCK_RUNTIME_KEY = "__PRO_MONOREPO_MOCK_RUNTIME__";

/**
 * 读取挂在全局对象上的 mock 运行时状态。
 *
 * 这样做的目的是保证：
 * 1. 同一页面里无论主应用还是子应用，Mock.setup 只执行一次。
 * 2. HMR 或微前端重复 mount 时，不会不断重复注册同一个接口。
 */
function getMockRuntimeState() {
  const runtime = globalThis as typeof globalThis & {
    [MOCK_RUNTIME_KEY]?: ProMonorepoMockState;
  };

  if (!runtime[MOCK_RUNTIME_KEY]) {
    runtime[MOCK_RUNTIME_KEY] = {
      initialized: false
    };
  }

  return runtime[MOCK_RUNTIME_KEY];
}

/**
 * 由于 Mock.js 使用正则匹配 URL，这里把统一接口地址转换成安全正则。
 */
function createApiPathPattern(path: string) {
  const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return new RegExp(`${escapedPath}(?:\\?.*)?$`);
}

/**
 * 注册演示接口。
 *
 * 所有应用共用同一个接口地址，真正返回哪份数据由 URL 上的 appScope 决定。
 */
function registerHttpDemoMock() {
  Mock.mock(createApiPathPattern(HTTP_DEMO_API_PATH), "get", ({ url }) => {
    const scope = resolveHttpDemoScope(url);

    return createHttpDemoResponse(scope);
  });
}

/**
 * 在浏览器端初始化共享 mock 能力。
 *
 * 使用方只需要在应用入口调用一次即可；
 * 如果同一个页面中有多个应用都调用该函数，也会通过全局状态自动去重。
 */
export function setupMock(_scope: MockAppScope) {
  const runtime = getMockRuntimeState();

  if (!runtime.initialized) {
    Mock.setup({
      timeout: "200-600"
    });
    registerHttpDemoMock();
    runtime.initialized = true;
  }
}
