<script setup lang="ts">
/**
 * 子应用 - vite-vue
 *
 * 通信规范：
 * 1. 只通过 micro-app 的数据中心与主应用交互。
 * 2. 不直接依赖主应用 window 事件，避免跨容器耦合。
 * 3. 所有消息统一使用结构化对象，便于后续扩展 ack、traceId、业务类型等字段。
 */
import { message } from "ant-design-vue";

type MicroAppName = "vite-vue" | "vite-react";

interface MicroAppMessage<TPayload = Record<string, unknown>> {
  source: "main" | MicroAppName;
  type: string;
  timestamp: number;
  payload: TPayload;
}

// 接收到的数据
const receivedData = ref<string>("");

function isMicroAppEnvironment() {
  return Boolean(window.__MICRO_APP_ENVIRONMENT__ && window.microApp);
}

// 发送数据到主应用
function sendDataToMain() {
  if (!isMicroAppEnvironment()) {
    message.warning("当前不是 micro-app 运行环境，无法回传主应用数据");

    return;
  }

  const data: MicroAppMessage<{ text: string }> = {
    source: "vite-vue",
    type: "sub.reply",
    timestamp: Date.now(),
    payload: {
      text: "来自子应用 vite-vue 的问候"
    }
  };

  // dispatch 会把数据发送到主应用对应的数据监听器。
  window.microApp.dispatch(data);

  message.success("数据已发送到主应用");
}

// 监听来自主应用的数据
function handleMainAppData(data: Record<PropertyKey, unknown>) {
  console.log("[子应用] 收到主应用数据:", data);
  receivedData.value = JSON.stringify(data, null, 2);
  message.info("收到主应用数据");
}

onMounted(() => {
  if (!isMicroAppEnvironment()) {
    return;
  }

  // autoTrigger=true 可确保子应用挂载后立即拿到主应用最近一次下发的缓存数据。
  window.microApp.addDataListener(handleMainAppData, true);
});

onUnmounted(() => {
  if (!isMicroAppEnvironment()) {
    return;
  }

  window.microApp.removeDataListener(handleMainAppData);
});
</script>

<template>
  <div class="sub-app">
    <h1 class="sub-app__title">子应用 - vite-vue</h1>

    <div class="sub-app__content">
      <a-card title="数据通信" class="sub-app__card">
        <a-space direction="vertical" style="width: 100%">
          <a-button type="primary" @click="sendDataToMain">发送数据到主应用</a-button>

          <a-divider>接收到的数据</a-divider>

          <div v-if="receivedData" class="sub-app__data">
            <pre>{{ receivedData }}</pre>
          </div>
          <a-empty v-else description="暂无数据" />
        </a-space>
      </a-card>
    </div>
  </div>
</template>

<style scoped lang="less">
.sub-app {
  padding: 16px;

  &__title {
    font-size: 20px;
    font-weight: 600;
    color: #1890ff;
    margin-bottom: 16px;
    text-align: center;
  }

  &__content {
    max-width: 600px;
    margin: 0 auto;
  }

  &__card {
    width: 100%;
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
