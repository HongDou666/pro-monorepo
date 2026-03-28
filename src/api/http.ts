import { createHttpClient, setupHttpInterceptors } from "@pro-monorepo/axios";
import { message } from "ant-design-vue";

/**
 * 主应用 access token 的本地存储 key。
 *
 * 这里采用固定 key，目的是让主应用、子应用以及未来可能新增的共享登录页
 * 都能围绕同一份 token 存取约定工作，避免每个应用维护不同字段名。
 */
const MAIN_ACCESS_TOKEN_KEY = "pro-monorepo:access-token";

/**
 * 主应用公共请求实例。
 *
 * 主应用通常承担聚合多个业务域和子应用入口的职责，因此默认并发数相对高一些，
 * 同时开启短时缓存，减少首页和面板类接口的重复请求。
 *
 * 当前配置含义：
 * 1. baseURL 优先读取环境变量，便于开发、测试、生产环境切换不同网关地址。
 * 2. timeout 统一设置为 10 秒，避免请求长时间挂起影响页面交互。
 * 3. x-app-name 用于在网关日志、埋点或后端排查时快速识别请求来源。
 * 4. 并发上限为 6，适合主应用这种聚合型页面并发拉取多个面板数据的场景。
 * 5. 默认重试 2 次，且每次延迟随重试次数递增，避免瞬时故障直接暴露给用户。
 * 6. 默认缓存 15 秒，适合首页展示类、只读类、变化不频繁的接口。
 */
export const mainHttp = createHttpClient({
  axiosConfig: {
    baseURL: import.meta.env.VITE_API_BASE_URL ?? "/",
    timeout: 10_000, // 10 秒超时
    headers: {
      "x-app-name": "main-app"
    }
  },
  concurrency: {
    maxConcurrent: 6 // 6 个并发请求上限
  },
  retry: {
    retries: 2, // 重试次数
    retryDelay: ({ attempt }: { attempt: number }) => attempt * 400 // 重试延迟，随重试次数递增
  },
  cache: {
    enabled: true, // 启用缓存
    ttl: 15_000 // 缓存时间，单位毫秒
  }
});

/**
 * 为主应用实例接入统一拦截器。
 *
 * 这里把“所有应用都需要的共性逻辑”集中在一处：
 * 1. 请求发出前自动读取并注入 token。
 * 2. 接口失败时统一弹出错误提示，避免每个页面重复处理 message.error。
 * 3. 响应为 401 时清理本地 token，为后续跳转登录页或重新鉴权预留入口。
 *
 * 注意：这里只处理通用能力；如果某个业务模块需要额外 headers、特殊业务码判断、
 * 或者自定义错误文案，应当在具体业务 API 模块中继续扩展，而不是回写到页面组件里。
 */
setupHttpInterceptors(mainHttp, {
  getToken: () => getMainAccessToken(), // 请求发出前自动读取 token 并注入 Authorization 头
  // 错误提示也放在这里统一处理，避免每个页面重复写 message.error。
  showError: (errorMessage: string) => {
    void message.error(errorMessage);
  },
  // 当响应为 401 时触发，通常表示未授权或登录态失效
  onUnauthorized: () => {
    clearMainAccessToken();
  }
});

/**
 * 读取主应用 token。
 *
 * 返回 null 代表当前没有登录态，拦截器会自动跳过 Authorization 注入。
 */
export function getMainAccessToken() {
  return localStorage.getItem(MAIN_ACCESS_TOKEN_KEY);
}

/**
 * 写入主应用 token。
 *
 * 一般应在登录成功、刷新 token 成功之后调用，保证后续请求能自动携带最新凭证。
 */
export function setMainAccessToken(token: string) {
  localStorage.setItem(MAIN_ACCESS_TOKEN_KEY, token);
}

/**
 * 清理主应用 token。
 *
 * 常见场景：
 * 1. 用户主动退出登录。
 * 2. 服务端返回 401，当前登录态失效。
 * 3. 本地鉴权信息损坏，需要强制重新登录。
 */
export function clearMainAccessToken() {
  localStorage.removeItem(MAIN_ACCESS_TOKEN_KEY);
}

/**
 * 统一暴露取消能力，便于路由守卫或页面卸载时复用。
 *
 * 这个函数不会区分请求来源，只要是 mainHttp 发起且尚未完成的请求，都会被一并取消。
 * 适合在以下场景调用：
 * 1. 路由切换，避免旧页面请求回写新页面状态。
 * 2. 查询条件快速切换，主动放弃上一轮结果。
 * 3. 页面销毁或模块卸载时释放挂起请求。
 */
export function cancelMainHttpRequests(reason = "Main route switched") {
  mainHttp.cancelAllRequests(reason);
}
