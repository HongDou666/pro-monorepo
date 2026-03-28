import type { App as VueApp } from "vue";
import { MOCK_APP_SCOPE, setupMockInDev } from "@pro-monorepo/mock";
import "ant-design-vue/dist/reset.css";
import "virtual:uno.css";
import "./style.css";
import App from "./App.vue";
import type { Router } from "vue-router";
import { cancelVueMicroRequests } from "./api/http";
import { createQiankunVueRouter } from "./router";
import { qiankunWindow, renderWithQiankun, type QiankunProps } from "vite-plugin-qiankun/dist/helper";
import { createApp } from "vue";
import { clearQiankunCommunicationActions, setQiankunCommunicationActions } from "./qiankun-communication";

// 当前 Vue 应用实例与 router 在多次挂载之间需要显式管理其生命周期。
let app: VueApp<Element> | null = null;
let router: Router | null = null;

// qiankun Vue 子应用通过共享包统一初始化开发态 Mock.js。
void setupMockInDev(MOCK_APP_SCOPE.QIANKUN_APP_VUE);

/**
 * 获取当前应该挂载的 #app 容器。
 *
 * 独立运行时直接使用文档里的 #app；
 * qiankun 托管运行时优先从主应用提供的 container 里查找；
 * 如果主应用清空了容器，则可以按需重新创建一个新的 #app。
 */
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

/**
 * 统一渲染入口。
 *
 * 这里负责：
 * 1. 判断当前是否处于 qiankun 托管模式。
 * 2. 同步通信适配层使用的 qiankun props。
 * 3. 创建 router、注册页面级守卫并完成最终挂载。
 */
async function render(props: QiankunProps = {}) {
  const container = resolveMountElement(props, true);
  const isMicroAppMode = Boolean(props.container) || Boolean(qiankunWindow.__POWERED_BY_QIANKUN__);

  setQiankunCommunicationActions(props);

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

  // 被主应用托管时统一从根路径进入，避免保留上一次 MemoryHistory 的内部页面状态。
  if (isMicroAppMode) {
    await router.replace("/");
  }

  // 先等待路由准备完成，再挂载应用，避免 router-view 首帧出现空白。
  await router.isReady();
  app.mount(container);
}

/**
 * 统一清理入口。
 *
 * 顺序为：
 * 1. 取消未完成请求。
 * 2. 清理 qiankun 通信上下文。
 * 3. 卸载 Vue 应用实例。
 * 4. 清空容器和 router 引用。
 */
function cleanup(props: QiankunProps = {}) {
  cancelVueMicroRequests("Qiankun Vue app unmount");
  clearQiankunCommunicationActions();

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
  // 主应用装载当前子应用时进入统一 render 流程。
  mount(props) {
    render(props);
  },
  // 主应用切换或卸载当前子应用时进入统一 cleanup 流程。
  unmount(props) {
    cleanup(props);
  },
  // 已挂载状态下收到主应用更新时，只同步最新通信动作即可。
  update(props) {
    setQiankunCommunicationActions(props);
    console.log("[qiankun-vite-vue] update", props);
  }
});

// 独立运行模式下不会经过 qiankun 生命周期，因此直接启动一次应用。
if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
  render();
}
