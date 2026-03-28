<script setup lang="ts">
import { message } from "ant-design-vue";
import { formatQiankunMessage } from "../../../../../shared/qiankun/communication";
import {
  isQiankunCommunicationRuntime,
  sendQiankunReplyToMain,
  subscribeToQiankunMainMessage
} from "../qiankun-communication";

// 页面上只展示最近一次由主应用下发到当前子应用的数据。
const receivedData = ref("");
// 保存取消订阅函数，确保页面离开时能正确清理监听。
let unsubscribeMainMessage: () => void = () => {};

/**
 * 主动向主应用发送回传数据。
 *
 * 这里和 React 页面行为保持一致，
 * 先做运行环境守卫，再通过适配层写入 qiankun global state。
 */
function sendDataToMain() {
  if (!isQiankunCommunicationRuntime()) {
    message.warning("当前不是 qiankun 运行环境，无法回传主应用数据");

    return;
  }

  const didUpdate = sendQiankunReplyToMain("qiankun-vite-vue", "来自子应用 qiankun-vite-vue 的问候");

  if (!didUpdate) {
    message.warning("数据发送失败，请稍后重试");

    return;
  }

  message.success("数据已发送到主应用");
}

onMounted(() => {
  if (!isQiankunCommunicationRuntime()) {
    return;
  }

  // 适配层内部会处理首次回放和 traceId 判重，这里只关心 UI 更新。
  unsubscribeMainMessage = subscribeToQiankunMainMessage("qiankun-vite-vue", data => {
    console.log("[qiankun-vite-vue] 收到主应用数据:", data);
    receivedData.value = formatQiankunMessage(data);
    message.info("收到主应用数据");
  });
});

onUnmounted(() => {
  unsubscribeMainMessage();
});
</script>

<template>
  <section class="communication-view">
    <a-card title="数据通信" class="communication-view__card">
      <a-space direction="vertical" style="width: 100%">
        <a-button type="primary" @click="sendDataToMain">发送数据到主应用</a-button>

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

    pre {
      margin: 0;
      font-size: 12px;
    }
  }
}
</style>
