export {
  appendMockScopeToParams,
  createHttpDemoResponse,
  HTTP_DEMO_API_PATH,
  isMockAppScope,
  MOCK_APP_SCOPE,
  resolveHttpDemoScope,
  type HttpDemoResponse,
  type MockAppScope
} from "./shared/http-demo";

/**
 * 开发态初始化共享 Mock.js。
 *
 * 让业务应用只关心“当前应用属于哪个 scope”，
 * 不需要再自己手写动态 import 和初始化去重逻辑。
 */
export async function setupMockInDev(scope: import("./shared/http-demo").MockAppScope) {
  if (!import.meta.env.DEV) {
    return false;
  }

  const { setupMock } = await import("./core/setup");

  setupMock(scope);

  return true;
}
