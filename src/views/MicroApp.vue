<script setup lang="ts">
/**
 * 微前端应用页面。
 *
 * 这里统一使用 micro-app 官方数据通道进行通信：
 * 1. 主应用通过 setData 向指定子应用下发消息。
 * 2. 主应用通过 addDataListener 订阅指定子应用回传的数据。
 *
 * 这样做比直接操作 iframe 和 window 自定义事件更稳定：
 * - 不依赖 DOM 结构。
 * - 不耦合 iframe 实现细节。
 * - 生命周期和缓存行为由 micro-app 托管。
 */
import { message } from "ant-design-vue";
import microApp from "@micro-zoe/micro-app";
import {
  createMicroAppMessage,
  formatMicroAppMessage,
  MICRO_APP_MESSAGE_TYPE,
  type MicroAppName
} from "../../shared/micro-app/communication";
import { MICRO_APP_URLS, isMicroAppDebugEnabled } from "@/plugins/micro-app-config";

// 当前选中的子应用
const currentApp = ref<MicroAppName>("vite-vue");

// 子应用配置
const microApps: Record<MicroAppName, { name: MicroAppName; url: string }> = {
  "vite-vue": {
    name: "vite-vue",
    url: MICRO_APP_URLS["vite-vue"]
  },
  "vite-react": {
    name: "vite-react",
    url: MICRO_APP_URLS["vite-react"]
  }
};

// 子应用加载状态
const loading = ref(true);

// 当前面板展示的最近一次通信内容
const receivedData = ref<string>("");

// 记录当前绑定的监听函数，切换子应用时需要先解绑旧监听
let activeDataListener: ((data: Record<PropertyKey, unknown>) => void) | null = null;
let activeListenerAppName: MicroAppName | null = null;

function bindSubAppDataListener(appName: MicroAppName) {
  unbindSubAppDataListener();

  // 使用稳定的单一监听器接收子应用回传消息。
  activeDataListener = data => {
    if (isMicroAppDebugEnabled()) {
      console.log(`[主应用] 收到 ${appName} 数据:`, data);
    }

    receivedData.value = formatMicroAppMessage(data);
    message.info(`收到 ${appName} 的通信数据`);
  };

  // autoTrigger=true 可以在子应用已发送过缓存数据时立即同步到主应用面板。
  microApp.addDataListener(appName, activeDataListener, true);
  activeListenerAppName = appName;
}

function unbindSubAppDataListener() {
  if (!activeDataListener || !activeListenerAppName) {
    return;
  }

  microApp.removeDataListener(activeListenerAppName, activeDataListener);
  activeDataListener = null;
  activeListenerAppName = null;
}

// 发送数据到子应用
function sendDataToSubApp() {
  const targetApp = currentApp.value;
  const data = createMicroAppMessage("main", MICRO_APP_MESSAGE_TYPE.MAIN_GREETING, {
    text: `来自主应用的问候，目标子应用: ${targetApp}`
  });

  // setData 会将消息交给 micro-app 数据中心管理。
  // 即使子应用稍后才挂载，只要子应用使用 addDataListener(autoTrigger=true)，也能拿到最近一次数据。
  microApp.setData(targetApp, data as unknown as Record<PropertyKey, unknown>);
  message.success(`数据已发送到 ${targetApp}`);
}

// 子应用加载完成
function handleMounted() {
  loading.value = false;

  if (isMicroAppDebugEnabled()) {
    console.log(`[MicroApp] ${currentApp.value} 加载完成`);
  }
}

// 子应用加载错误
function handleError() {
  loading.value = false;
  console.error(`[MicroApp] ${currentApp.value} 加载失败`);
  message.error(`${currentApp.value} 加载失败，请检查子应用服务或环境变量配置`);
}

onMounted(() => {
  bindSubAppDataListener(currentApp.value);
});

onUnmounted(() => {
  unbindSubAppDataListener();
});

watch(currentApp, nextApp => {
  loading.value = true;
  receivedData.value = "";
  unbindSubAppDataListener();
  bindSubAppDataListener(nextApp);
});
</script>

<template>
  <div class="micro-app">
    <h1 class="micro-app__title">微前端应用</h1>

    <div class="micro-app__content">
      <a-card title="快速操作" class="micro-app__card">
        <a-space direction="vertical" style="width: 100%">
          <a-radio-group v-model:value="currentApp">
            <a-radio-button value="vite-vue">vite-vue</a-radio-button>
            <a-radio-button value="vite-react">vite-react</a-radio-button>
          </a-radio-group>

          <a-divider style="margin: 12px 0" />

          <a-button type="primary" :loading="loading" @click="sendDataToSubApp">发送数据到子应用</a-button>

          <a-divider style="margin: 12px 0">接收到的数据</a-divider>

          <div v-if="receivedData" class="micro-app__data">
            <pre>{{ receivedData }}</pre>
          </div>
          <a-empty v-else description="暂无数据" :image-style="{ height: '40px' }" />
        </a-space>
      </a-card>

      <a-card title="子应用" class="micro-app__card micro-app__card--container">
        <div class="micro-app__container">
          <!-- 子应用容器 -->
          <micro-app
            :name="microApps[currentApp].name"
            :url="microApps[currentApp].url"
            iframe
            @mounted="handleMounted"
            @error="handleError"
          />
        </div>
      </a-card>
    </div>
  </div>
</template>

<style scoped lang="less">
.micro-app {
  display: flex;
  flex: 1;
  flex-direction: column;
  box-sizing: border-box;
  min-height: 100%;

  &__title {
    font-size: 22px;
    font-weight: 600;
    color: #1890ff;
    margin: 6px 0 12px;
  }

  &__content {
    display: grid;
    flex: 1;
    align-content: start;
    grid-template-columns: 260px 1fr;
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
      height: 100%;

      :deep(.ant-card-body) {
        flex: 1;
        overflow: hidden;
      }
    }
  }

  &__container {
    width: 100%;
    height: 100%;

    micro-app {
      width: 100%;
      height: 100%;
    }
  }

  &__data {
    padding: 12px;
    background: #f5f5f5;
    border-radius: 4px;
    max-height: 200px;
    overflow: auto;

    pre {
      margin: 0;
      font-size: 12px;
    }
  }
}
</style>
