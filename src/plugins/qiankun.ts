import { start } from "qiankun";

let hasStartedQiankun = false;

/**
 * 启动 qiankun 运行时。
 *
 * 当前主应用使用 loadMicroApp 手动切换子应用，
 * 因此这里只需要全局启动一次运行时即可。
 */
export function setupQiankun(): void {
  if (hasStartedQiankun) {
    return;
  }

  start({
    prefetch: false, // 关闭预加载，保持子应用按需加载的行为
    sandbox: {
      // 关闭样式隔离，允许子应用样式影响主应用，适合同源场景
      strictStyleIsolation: false
    }
  });

  hasStartedQiankun = true;
}
