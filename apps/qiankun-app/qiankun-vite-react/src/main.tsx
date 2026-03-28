import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";
import "virtual:uno.css";
import "./index.css";
import App from "./App";
import { clearQiankunCommunicationActions, setQiankunCommunicationActions } from "./qiankun-communication";

// React 18 root 需要跨多次 mount/unmount 复用并按容器变化安全重建。
let root: Root | null = null;
let rootElement: Element | null = null;

/**
 * 获取当前应该挂载的根节点。
 *
 * 在独立运行模式下使用页面原生的 #root；
 * 在 qiankun 模式下优先从主应用传入的 container 内查找；
 * 如果主应用在卸载时把根节点一起清空了，这里可以按需重新补回一个新的 #root。
 */
function resolveMountElement(props: QiankunProps = {}, createIfMissing = false) {
  const mountElement = props.container?.querySelector("#root") ?? document.getElementById("root");

  if (mountElement || !createIfMissing || !props.container) {
    return mountElement;
  }

  const nextMountElement = document.createElement("div");
  nextMountElement.id = "root";
  props.container.appendChild(nextMountElement);

  return nextMountElement;
}

/**
 * 统一渲染入口。
 *
 * 这里同时处理三件事：
 * 1. 判断当前是独立运行还是 qiankun 托管运行。
 * 2. 把 qiankun 通信动作注入页面侧适配层。
 * 3. 根据挂载容器是否变化，决定复用还是重建 React root。
 */
function render(props: QiankunProps = {}) {
  const container = resolveMountElement(props, true);
  const isMicroAppMode = Boolean(props.container) || Boolean(qiankunWindow.__POWERED_BY_QIANKUN__);

  setQiankunCommunicationActions(props);

  if (!container) {
    throw new Error("React qiankun app mount container #root not found");
  }

  // 如果 qiankun 在重挂载时替换了容器节点，必须先卸载旧 root，再绑定到新容器。
  if (root && rootElement !== container) {
    root.unmount();
    root = null;
    rootElement = null;
  }

  // 只有第一次渲染或容器变化后才需要重新创建 root。
  if (!root) {
    root = createRoot(container);
    rootElement = container;
  }

  // 被主应用托管时使用 MemoryRouter，避免子应用路由直接改写主应用 URL。
  const router = isMicroAppMode ? (
    <MemoryRouter initialEntries={["/"]}>
      <App />
    </MemoryRouter>
  ) : (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );

  root.render(router);
}

/**
 * 统一清理入口。
 *
 * 卸载顺序保持为：
 * 1. 先清理通信上下文。
 * 2. 再卸载 React root。
 * 3. 最后移除容器中的残留 DOM。
 */
function cleanup(props: QiankunProps = {}) {
  const container = resolveMountElement(props);

  clearQiankunCommunicationActions();

  if (root) {
    root.unmount();
    root = null;
    rootElement = null;
  }

  if (container) {
    container.replaceChildren();
  }
}

/**
 * React 子应用启动入口。
 *
 * 和 Vue 子应用一样，这里既要支持独立运行，也要支持被主应用通过 qiankun 嵌入。
 * 因此入口把独立渲染逻辑与 qiankun 生命周期导出统一收口。
 */
renderWithQiankun({
  bootstrap() {
    console.log("[qiankun-vite-react] bootstrap");
  },
  // 主应用真正装载子应用时，从这里进入统一 render。
  mount(props) {
    render(props);
  },
  // 主应用切换或卸载子应用时，从这里做完整清理。
  unmount(props) {
    cleanup(props);
  },
  // 某些场景下 qiankun 会向已挂载子应用派发更新，这里只同步最新通信动作即可。
  update(props) {
    setQiankunCommunicationActions(props);
    console.log("[qiankun-vite-react] update", props);
  }
});

// 独立开发模式下不会经过 qiankun 生命周期，因此手动触发一次 render。
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}
