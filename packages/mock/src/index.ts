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
 *
 * 执行策略分两步：
 * 1. 先通过 Vite 注入的开发态常量做环境门禁，生产环境直接短路返回 false。
 * 2. 仅在确认是开发态后，再动态加载真正的 setup 模块。
 *
 * 动态 import 的价值：
 * - 避免生产构建无条件把 Mock.js 相关代码打进首包。
 * - 让 package 构建保持更轻，只有真正启用时才加载 setup 逻辑。
 * - 与主应用/子应用统一复用这一入口，减少各处手写条件分支。
 *
 * 返回值语义：
 * - true: 当前确实执行了 Mock 初始化。
 * - false: 当前环境不应启用 Mock，因此直接跳过。
 *
 * @param scope 当前应用所属的 mock scope，用于区分主应用、Vue 子应用、React 子应用等演示数据来源
 */
export async function setupMockInDev(scope: import("./shared/http-demo").MockAppScope) {
  // 直接使用 import.meta.env.DEV，让 Vite 在生产构建时能静态删除后面的动态 import。
  if (!import.meta.env.DEV) {
    return false;
  }

  // 只有开发态才加载 setup 模块，避免无意义地把 Mock 运行时代码提前执行或提前打包到入口。
  const { setupMock } = await import("./core/setup");

  // scope 决定当前应用命中哪一组演示接口返回值。
  setupMock(scope);

  return true;
}
