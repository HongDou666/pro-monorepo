import type { App as VueApp } from "vue";
import "ant-design-vue/dist/reset.css";
import "virtual:uno.css";
import "./style.css";
import App from "./App.vue";
import type { Router } from "vue-router";
import { cancelVueMicroRequests } from "./api/http";
import { createQiankunVueRouter } from "./router";
import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";
import { createApp } from "vue";

let app: VueApp<Element> | null = null;
let router: Router | null = null;

function resolveMountElement(props: QiankunProps = {}, createIfMissing = false) {
  const mountElement = props.container?.querySelector("#app") ?? document.getElementById("app");

  if (mountElement || !createIfMissing || !props.container) {
    return mountElement;
  }

  const nextMountElement = document.createElement("div");
  nextMountElement.id = "app";
  props.container.appendChild(nextMountElement);

  return nextMountElement;
}

async function render(props: QiankunProps = {}) {
  const container = resolveMountElement(props, true);
  const isMicroAppMode = Boolean(props.container) || Boolean(qiankunWindow.__POWERED_BY_QIANKUN__);

  if (!container) {
    throw new Error("Vue qiankun app mount container #app not found");
  }

  router = createQiankunVueRouter(isMicroAppMode);

  // 路由切换时主动取消当前子应用未完成请求，避免旧页面响应回写到新页面。
  router.beforeEach((to, from, next) => {
    if (to.fullPath !== from.fullPath) {
      cancelVueMicroRequests(`Qiankun Vue route switching to ${to.fullPath}`);
    }

    next();
  });

  app = createApp(App);
  app.use(router);

  if (isMicroAppMode) {
    await router.replace("/");
  }

  await router.isReady();
  app.mount(container);
}

function cleanup(props: QiankunProps = {}) {
  cancelVueMicroRequests("Qiankun Vue app unmount");

  if (app) {
    app.unmount();
    app = null;
  }

  const container = resolveMountElement(props);
  if (container) {
    container.replaceChildren();
  }

  router = null;
}

/**
 * Vue 子应用启动入口。
 *
 * 这个入口同时要兼容两种运行方式：
 * 1. 独立开发运行，直接作为普通 Vite 应用启动。
 * 2. 被主应用通过 qiankun 托管，在容器中渲染。
 *
 * 因此入口把“渲染”和“生命周期导出”分开管理。
 */
renderWithQiankun({
  bootstrap() {
    console.log("[qiankun-vite-vue] bootstrap");
  },
  mount(props) {
    render(props);
  },
  unmount(props) {
    cleanup(props);
  },
  update(props) {
    console.log("[qiankun-vite-vue] update", props);
  }
});

if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}
