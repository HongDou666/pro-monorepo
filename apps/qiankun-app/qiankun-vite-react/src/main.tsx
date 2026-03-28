import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";
import "virtual:uno.css";
import "./index.css";
import App from "./App";

let root: Root | null = null;
let rootElement: Element | null = null;

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

function render(props: QiankunProps = {}) {
  const container = resolveMountElement(props, true);
  const isMicroAppMode = Boolean(props.container) || Boolean(qiankunWindow.__POWERED_BY_QIANKUN__);

  if (!container) {
    throw new Error("React qiankun app mount container #root not found");
  }

  if (root && rootElement !== container) {
    root.unmount();
    root = null;
    rootElement = null;
  }

  if (!root) {
    root = createRoot(container);
    rootElement = container;
  }

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

function cleanup(props: QiankunProps = {}) {
  const container = resolveMountElement(props);

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
  mount(props) {
    render(props);
  },
  unmount(props) {
    cleanup(props);
  },
  update(props) {
    console.log("[qiankun-vite-react] update", props);
  }
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}
