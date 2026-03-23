<script setup lang="ts">
import {
  fetchVueMicroHttpDemo,
  getVueMicroHttpCacheKeys,
  getVueMicroPendingRequestCount,
  type VueMicroHttpDemoResponse
} from "../api/demo";
import { cancelVueMicroRequests } from "../api/http";

const responseData = ref<VueMicroHttpDemoResponse | null>(null);
const requestLogs = ref<string[]>(["Vue 子应用可通过 src/api/http.ts 统一发起请求"]);
const loading = ref(false);

function appendLog(content: string) {
  requestLogs.value = [content, ...requestLogs.value].slice(0, 6);
}

async function loadDemo(useCache: boolean) {
  loading.value = true;

  try {
    const response = await fetchVueMicroHttpDemo({
      runtimeOptions: {
        cache: useCache ? { ttl: 12_000 } : false
      }
    });

    responseData.value = response.data;
    appendLog(
      `${useCache ? "缓存模式" : "直连模式"}请求完成，缓存条目 ${getVueMicroHttpCacheKeys().length}，待处理请求 ${getVueMicroPendingRequestCount()}`
    );
  } catch (error) {
    appendLog(`请求失败: ${(error as Error).message}`);
  } finally {
    loading.value = false;
  }
}

function cancelRequests() {
  cancelVueMicroRequests("Vue micro http demo canceled manually");
  appendLog(`已取消未完成请求，当前待处理 ${getVueMicroPendingRequestCount()}`);
}
</script>

<template>
  <section class="http-view">
    <div class="http-view__intro">
      <p class="http-view__eyebrow">shared request client</p>
      <h2 class="http-view__title">公共请求包示例</h2>
      <p class="http-view__desc">
        当前页面通过 <code>@pro-monorepo/axios</code> 创建的 Vue 子应用专属实例读取本地 mock 数据，
        用于验证共享封装在子应用内的接入方式。
      </p>
    </div>

    <a-card title="请求操作" class="http-view__card">
      <a-space direction="vertical" size="large" style="width: 100%">
        <a-space wrap>
          <a-button type="primary" :loading="loading" @click="loadDemo(true)">读取缓存数据</a-button>
          <a-button :loading="loading" @click="loadDemo(false)">绕过缓存请求</a-button>
          <a-button danger @click="cancelRequests">取消未完成请求</a-button>
        </a-space>
        <div class="http-view__result">
          <pre v-if="responseData">{{ JSON.stringify(responseData, null, 2) }}</pre>
          <span v-else>点击按钮读取 public/mock/http-demo.json。</span>
        </div>
      </a-space>
    </a-card>

    <a-card title="最近操作" class="http-view__card">
      <ul class="http-view__logs">
        <li v-for="item in requestLogs" :key="item" class="http-view__log-item">
          {{ item }}
        </li>
      </ul>
    </a-card>
  </section>
</template>

<style scoped lang="less">
.http-view {
  display: flex;
  flex-direction: column;
  gap: 20px;

  &__intro {
    padding: 28px;
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
    box-shadow: 0 12px 32px rgb(15 23 42 / 6%);
  }

  &__eyebrow {
    margin: 0 0 8px;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #0f766e;
  }

  &__title {
    margin: 0 0 12px;
    font-size: 28px;
    color: #0f172a;
  }

  &__desc {
    margin: 0;
    color: #475569;
    font-size: 15px;
    line-height: 1.7;

    code {
      padding: 2px 8px;
      border-radius: 999px;
      background: rgb(15 118 110 / 10%);
      color: #115e59;
      font-size: 13px;
    }
  }

  &__card {
    border-radius: 20px;

    :deep(.ant-card-body) {
      padding: 20px;
    }
  }

  &__result {
    min-height: 120px;
    padding: 14px;
    border: 1px dashed #cbd5e1;
    border-radius: 14px;
    background: #f8fafc;
    color: #0f172a;
    overflow: auto;

    pre {
      margin: 0;
      font-size: 12px;
      line-height: 1.6;
    }
  }

  &__logs {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__log-item {
    padding: 12px 14px;
    border-radius: 14px;
    background: #f8fafc;
    color: #334155;
    font-size: 14px;
    line-height: 1.6;
  }
}
</style>
