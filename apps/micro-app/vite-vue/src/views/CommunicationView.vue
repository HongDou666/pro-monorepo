<script setup lang="ts">
/**
 * 子应用 - vite-vue 通信页。
 *
 * 这里保留 antd 组件与微前端通信逻辑，并通过路由懒加载实现按需下载：
 * 1. 首页不再携带通信页代码。
 * 2. antd 组件只在访问通信页时进入浏览器缓存。
 */
import { message } from "ant-design-vue";
import {
  createMicroAppMessage,
  formatMicroAppMessage,
  isMicroAppRuntime,
  MICRO_APP_MESSAGE_TYPE,
  type MicroAppMessage
} from "../../../../../shared/micro-app/communication";

const receivedData = ref<string>("");
const syncedContextData = ref<string>("");

/**
 * 主动向主应用发送消息。
 *
 * 发送前必须先判断当前是否运行在 micro-app 容器中，
 * 否则独立运行时 window.microApp 不存在，会直接报错。
 */
function sendDataToMain() {
  if (!isMicroAppRuntime(window)) {
    message.warning("当前不是 micro-app 运行环境，无法回传主应用数据");

    return;
  }

  const data = createMicroAppMessage("vite-vue", MICRO_APP_MESSAGE_TYPE.SUB_REPLY, {
    text: "来自子应用 vite-vue 的问候"
  });

  window.microApp.dispatch(data as unknown as Record<PropertyKey, unknown>);
}

/**
 * 处理主应用下发的数据。
 *
 * 这里统一格式化后再显示，便于观察标准消息结构中的 source、type、traceId 等字段。
 */
function handleMainAppData(data: Record<PropertyKey, unknown>) {
  const microAppMessage = data as unknown as MicroAppMessage;

  if (!microAppMessage.type || microAppMessage.type === MICRO_APP_MESSAGE_TYPE.MAIN_CONTEXT) {
    syncedContextData.value = typeof data.value === "string" ? data.value : "";

    return;
  }

  console.log("[子应用] 收到主应用数据:", data);
  receivedData.value = formatMicroAppMessage(data);
  message.info("收到主应用数据");
}

onMounted(() => {
  if (!isMicroAppRuntime(window)) {
    return;
  }

  // autoTrigger=true 可在子应用后挂载时立即拿到主应用最近一次下发的数据。
  window.microApp.addDataListener(handleMainAppData, true);
});

onUnmounted(() => {
  if (!isMicroAppRuntime(window)) {
    return;
  }

  // 卸载时移除监听，避免同一页面反复进入后重复收到消息。
  window.microApp.removeDataListener(handleMainAppData);
});
</script>

<template>
  <section class="communication-view">
    <a-card title="数据通信" class="communication-view__card">
      <a-space direction="vertical" style="width: 100%">
        <a-button type="primary" @click="sendDataToMain">发送数据到主应用</a-button>

        <a-divider>容器同步 data</a-divider>

        <div v-if="syncedContextData" class="communication-view__data">
          {{ syncedContextData }}
        </div>
        <a-empty v-else description="暂无同步数据" />

        <a-divider>接收到的数据</a-divider>

        <div v-if="receivedData" class="communication-view__data">
          <pre>{{ receivedData }}</pre>
        </div>
        <a-empty v-else description="暂无数据" />
      </a-space>
    </a-card>
  </section>
</template>

<style scoped lang="less">
.communication-view {
  &__card {
    width: min(100%, 640px);
    margin: 0 auto;
  }

  &__data {
    padding: 12px;
    max-height: 220px;
    overflow: auto;
    border-radius: 8px;
    background: #f8fafc;
    font-size: 12px;
  }
}
</style>
