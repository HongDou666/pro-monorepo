<script setup lang="ts">
import type { MicroApp } from "qiankun";
import { loadMicroApp } from "qiankun";
import { message } from "ant-design-vue";
import { QIANKUN_SUB_APP_URLS, isQiankunDebugEnabled, type QiankunSubAppName } from "@/plugins/qiankun-app-config";

type QiankunSubAppMeta = {
  name: QiankunSubAppName;
  title: string;
  description: string;
  url: string;
};

const currentApp = ref<QiankunSubAppName>("qiankun-vite-vue");
const loading = ref(true);
const errorMessage = ref("");
const activeAppName = ref<QiankunSubAppName | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);

const subApps: Record<QiankunSubAppName, QiankunSubAppMeta> = {
  "qiankun-vite-vue": {
    name: "qiankun-vite-vue",
    title: "vite-vue",
    description: "Vue 子应用，包含共享组件和请求示例。",
    url: QIANKUN_SUB_APP_URLS["qiankun-vite-vue"]
  },
  "qiankun-vite-react": {
    name: "qiankun-vite-react",
    title: "vite-react",
    description: "React 子应用，包含共享请求示例。",
    url: QIANKUN_SUB_APP_URLS["qiankun-vite-react"]
  }
};

let microApp: MicroApp | null = null;
let microAppTask: Promise<void> = Promise.resolve();

const currentAppMeta = computed(() => subApps[currentApp.value]);

const statusText = computed(() => {
  if (loading.value) {
    return "加载中";
  }

  if (errorMessage.value) {
    return "加载失败";
  }

  return activeAppName.value ? "运行中" : "未启动";
});

async function unmountCurrentMicroApp() {
  if (!microApp) {
    activeAppName.value = null;

    return;
  }

  try {
    await microApp.unmount();
  } finally {
    microApp = null;
    activeAppName.value = null;
  }
}

async function mountCurrentMicroApp() {
  await nextTick();

  const container = containerRef.value;

  if (!container) {
    errorMessage.value = "子应用容器尚未准备好";

    return;
  }

  loading.value = true;
  errorMessage.value = "";

  await unmountCurrentMicroApp();

  const targetApp = currentAppMeta.value;

  if (isQiankunDebugEnabled()) {
    console.log("[Qiankun] 准备加载子应用:", targetApp);
  }

  try {
    microApp = loadMicroApp(
      {
        name: targetApp.name,
        entry: targetApp.url,
        container,
        props: {
          hostApp: "pro-monorepo-main",
          hostRoute: "/qiankun-app"
        }
      },
      undefined,
      {
        beforeMount: [
          () => {
            loading.value = true;

            return Promise.resolve();
          }
        ],
        afterMount: [
          () => {
            loading.value = false;
            activeAppName.value = targetApp.name;

            return Promise.resolve();
          }
        ],
        beforeUnmount: [
          () => {
            loading.value = true;

            return Promise.resolve();
          }
        ],
        afterUnmount: [
          () => {
            loading.value = false;

            return Promise.resolve();
          }
        ]
      }
    );

    await microApp.mountPromise;
  } catch (error) {
    microApp = null;
    activeAppName.value = null;
    loading.value = false;
    errorMessage.value = (error as Error).message || `${targetApp.title} 加载失败`;
    console.error("[Qiankun] 子应用加载失败:", error);
  }
}

function queueMicroAppTask(task: () => Promise<void>) {
  microAppTask = microAppTask.catch(() => undefined).then(task);

  return microAppTask;
}

function reloadCurrentMicroApp() {
  void queueMicroAppTask(mountCurrentMicroApp);
}

async function handleUnmountCurrentApp() {
  await queueMicroAppTask(unmountCurrentMicroApp);
  message.info("子应用已卸载");
}

function openCurrentMicroAppInNewTab() {
  window.open(currentAppMeta.value.url, "_blank", "noopener,noreferrer");
}

async function handleSwitchApp(nextApp: QiankunSubAppName) {
  if (nextApp === currentApp.value && activeAppName.value === nextApp && !errorMessage.value) {
    return;
  }

  currentApp.value = nextApp;
  await queueMicroAppTask(mountCurrentMicroApp);
}

onMounted(() => {
  void queueMicroAppTask(mountCurrentMicroApp);
});

onBeforeUnmount(() => {
  void queueMicroAppTask(unmountCurrentMicroApp);
});
</script>

<template>
  <div class="qiankun-app">
    <div class="qiankun-app__content">
      <a-card title="快速操作" class="qiankun-app__card">
        <a-space direction="vertical" style="width: 100%">
          <a-radio-group :value="currentApp" @update:value="handleSwitchApp">
            <a-radio-button value="qiankun-vite-vue">vite-vue</a-radio-button>
            <a-radio-button value="qiankun-vite-react">vite-react</a-radio-button>
          </a-radio-group>

          <a-divider style="margin: 12px 0" />

          <div class="qiankun-app__summary">
            <p><strong>状态：</strong>{{ statusText }}</p>
            <p><strong>入口：</strong>{{ currentAppMeta.url }}</p>
            <p><strong>说明：</strong>{{ currentAppMeta.description }}</p>
          </div>

          <a-space wrap>
            <a-button type="primary" :loading="loading" @click="reloadCurrentMicroApp">重新加载</a-button>
            <a-button @click="openCurrentMicroAppInNewTab">独立打开</a-button>
            <a-button v-if="activeAppName" danger @click="handleUnmountCurrentApp">卸载当前应用</a-button>
          </a-space>

          <a-divider style="margin: 12px 0">运行方式</a-divider>

          <div class="qiankun-app__tips">
            <p>主应用通过 qiankun.loadMicroApp 按需装载子应用。</p>
            <p>两个子应用已移除原先依赖 micro-app 数据中心的通信演示页。</p>
          </div>
        </a-space>
      </a-card>

      <a-card title="子应用" class="qiankun-app__card qiankun-app__card--container">
        <div class="qiankun-app__container-wrapper">
          <div v-if="loading" class="qiankun-app__overlay">正在加载 {{ currentAppMeta.title }}...</div>
          <a-result v-else-if="errorMessage" status="error" title="子应用加载失败" :sub-title="errorMessage">
            <template #extra>
              <a-space>
                <a-button type="primary" @click="reloadCurrentMicroApp">重试</a-button>
                <a-button @click="openCurrentMicroAppInNewTab">直接打开子应用</a-button>
              </a-space>
            </template>
          </a-result>

          <div ref="containerRef" class="qiankun-app__container" :class="{ 'is-hidden': !!errorMessage }" />
        </div>
      </a-card>
    </div>
  </div>
</template>

<style scoped lang="less">
.qiankun-app {
  display: flex;
  flex: 1;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 100%;

  &__content {
    display: grid;
    flex: 1;
    align-content: start;
    grid-template-columns: 320px 1fr;
    grid-template-rows: 1fr;
    gap: 24px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &__card {
    :deep(.ant-radio-group) {
      display: flex;
      flex-direction: column;
      gap: 10px;

      > label {
        border-radius: 0;
      }
    }

    &--container {
      display: flex;
      flex-direction: column;
      min-height: 720px;

      :deep(.ant-card-body) {
        flex: 1;
        overflow: hidden;
      }
    }
  }

  &__summary,
  &__tips {
    display: flex;
    flex-direction: column;
    gap: 8px;
    color: #475569;
    font-size: 13px;
    line-height: 1.6;

    p {
      margin: 0;
    }
  }

  &__container-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 640px;
    border-radius: 12px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    overflow: hidden;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgb(255 255 255 / 86%);
    color: #475569;
    backdrop-filter: blur(2px);
  }

  &__container {
    width: 100%;
    height: 100%;
    min-height: 640px;

    &.is-hidden {
      visibility: hidden;
    }
  }
}
</style>
