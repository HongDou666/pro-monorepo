<script setup lang="ts">
import {
  fetchMainHttpDemo,
  getMainHttpCacheKeys,
  getMainPendingRequestCount,
  type MainHttpDemoResponse
} from "@/api/demo";
import { cancelMainHttpRequests } from "@/api/http";

// 页面上展示最近一次接口响应，用于验证主应用请求实例是否工作正常。
const httpDemo = ref<MainHttpDemoResponse | null>(null);
// 日志只保留最近几条，避免演示页无限累积文本。
const httpLogs = ref<string[]>(["主应用请求实例已创建，可直接从 @/api/http 与 @/api/demo 复用"]);
const isLoadingDemo = ref(false);

// 把新日志插到顶部，更符合“最近事件优先看”的调试习惯。
function pushLog(content: string) {
  httpLogs.value = [content, ...httpLogs.value].slice(0, 6);
}

/**
 * 读取演示接口。
 *
 * 通过切换 useCache 可以直观看到同一接口在“走缓存”和“绕过缓存”两种模式下的表现。
 */
async function handleLoadDemo(useCache: boolean) {
  isLoadingDemo.value = true;
  try {
    const response = await fetchMainHttpDemo({
      runtimeOptions: { cache: useCache ? { ttl: 20_000 } : false }
    });

    httpDemo.value = response.data;
    pushLog(
      `${useCache ? "缓存模式" : "直连模式"}请求完成，缓存条目 ${getMainHttpCacheKeys().length}，待处理请求 ${getMainPendingRequestCount()}`
    );
  } catch (error) {
    pushLog(`请求失败: ${(error as Error).message}`);
  } finally {
    isLoadingDemo.value = false;
  }
}

// 手动取消按钮用于演示实例级取消能力，不区分由哪个页面发起。
function handleCancelRequests() {
  cancelMainHttpRequests("Home demo canceled manually");
  pushLog(`已取消主应用未完成请求，当前待处理 ${getMainPendingRequestCount()}`);
}
</script>

<template>
  <div class="home">
    <section class="mb-6 pro-dashboard-hero">
      <p class="pro-eyebrow text-brand-deep">monorepo workspace</p>
      <div class="items-start mt-4 pro-dashboard-grid">
        <div>
          <h1 class="md:text-[40px] pro-title text-[32px]">首页</h1>
          <p class="max-w-[52ch] mt-3 pro-desc">
            当前仓库已经具备共享 lint、共享 stylelint 与共享 UnoCSS 配置，主应用与两个子应用可以复用同一套设计 token。
          </p>
        </div>
        <div class="pro-panel-muted px-5 py-4 text-left">
          <p class="pro-eyebrow text-success">style system</p>
          <p class="leading-7 mt-3 text-ink-muted text-sm">
            UnoCSS 负责原子类与基础语义 shortcuts，业务局部样式继续由 Less 与组件样式承接，避免样式职责混乱。
          </p>
        </div>
      </div>
    </section>

    <div class="home__content">
      <a-card title="packages 物料组件演示" class="home__card">
        <a-space direction="vertical">
          <InputStorage />
          <RangePicker />
        </a-space>
      </a-card>

      <a-card title="项目特性" class="home__card">
        <ul class="home__feature-list">
          <li class="home__feature-item">
            <strong>Vue 3 + TypeScript</strong>
            <span>现代化的前端技术栈</span>
          </li>
          <li class="home__feature-item">
            <strong>Vite 构建</strong>
            <span>极速的开发体验</span>
          </li>
          <li class="home__feature-item">
            <strong>Monorepo 架构</strong>
            <span>统一管理多个包</span>
          </li>
          <li class="home__feature-item">
            <strong>自动导入</strong>
            <span>API 和组件自动注册</span>
          </li>
        </ul>
      </a-card>

      <a-card title="公共请求包接入示例" class="home__card">
        <a-space direction="vertical" size="middle" style="width: 100%">
          <p class="home__tip">
            主应用已经接入 <code>@pro-monorepo/axios</code> 与 <code>@pro-monorepo/mock</code>，
            默认开启并发控制、失败重试、短时缓存与共享 Mock.js 拦截。
          </p>
          <a-space wrap>
            <a-button type="primary" :loading="isLoadingDemo" @click="handleLoadDemo(true)">读取缓存数据</a-button>
            <a-button :loading="isLoadingDemo" @click="handleLoadDemo(false)">绕过缓存请求</a-button>
            <a-button danger @click="handleCancelRequests">取消未完成请求</a-button>
          </a-space>
          <div class="home__result">
            <pre v-if="httpDemo">{{ JSON.stringify(httpDemo, null, 2) }}</pre>
            <span v-else>点击上方按钮请求共享 Mock.js 接口 /api/demo/http，验证主应用请求实例。</span>
          </div>
          <ul class="home__log-list">
            <li v-for="item in httpLogs" :key="item" class="home__log-item">
              {{ item }}
            </li>
          </ul>
        </a-space>
      </a-card>
    </div>
  </div>
</template>

<style scoped lang="less">
.home {
  padding: 24px;
  width: 100%;

  &__title {
    font-size: 28px;
    font-weight: 600;
    color: #1890ff;
    margin: 6px 0 12px;
  }

  &__content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  &__card {
    margin-bottom: 16px;
    :deep(.pro-input-storage) {
      .pro-input-storage__key,
      .pro-input-storage__value {
        width: 120px;
      }
    }
  }

  &__tip {
    margin: 0;
    color: #4b5563;
    font-size: 14px;
    line-height: 1.7;

    code {
      padding: 2px 8px;
      border-radius: 999px;
      background: #eef2ff;
      color: #4338ca;
      font-size: 13px;
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

  &__log-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__log-item {
    padding: 10px 12px;
    border-radius: 12px;
    background: #f8fafc;
    color: #475569;
    font-size: 13px;
  }

  &__feature-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__feature-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 14px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    background: #fbfdff;

    strong {
      color: #0f172a;
      font-size: 15px;
      font-weight: 600;
    }

    span {
      color: #64748b;
      font-size: 13px;
      line-height: 1.6;
    }
  }
}
</style>
