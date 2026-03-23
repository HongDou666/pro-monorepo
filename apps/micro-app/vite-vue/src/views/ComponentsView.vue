<script setup lang="ts">
import { ProInputStorage, ProRangePicker } from "@pro-monorepo/components";

const dateRange = ref<[string, string] | null>(null);
const operationLogs = ref<string[]>([
  "已接入 @pro-monorepo/components 共享组件包",
  "你可以在这里验证组件在子应用中的真实表现"
]);

function pushLog(content: string) {
  operationLogs.value = [content, ...operationLogs.value].slice(0, 6);
}

function handleStorageSet(key: string, value: string) {
  pushLog(`存储成功: ${key} = ${value}`);
}

function handleStorageRemove(key: string) {
  pushLog(`删除成功: ${key}`);
}

function handleStorageError(errorMessage: string) {
  pushLog(`操作提示: ${errorMessage}`);
}

function handleRangeChange(value: [string, string] | null) {
  pushLog(value ? `选择日期范围: ${value[0]} ~ ${value[1]}` : "已清空日期范围");
}
</script>

<template>
  <section class="components-view">
    <div class="components-view__intro">
      <p class="components-view__eyebrow">shared components</p>
      <h2 class="components-view__title">公共包组件演示</h2>
      <p class="components-view__desc">
        当前页面直接消费 workspace 中的
        <code>@pro-monorepo/components</code>，用于验证子应用对共享组件的接入、样式和交互表现。
      </p>
    </div>

    <div class="components-view__grid">
      <a-card title="ProInputStorage" class="components-view__card">
        <a-space direction="vertical" size="large" style="width: 100%">
          <p class="components-view__tip">用于快速演示 localStorage / sessionStorage 的增删操作。</p>
          <ProInputStorage
            key-placeholder="请输入缓存键名"
            value-placeholder="请输入缓存值"
            @set="handleStorageSet"
            @remove="handleStorageRemove"
            @error="handleStorageError"
          />
        </a-space>
      </a-card>

      <a-card title="ProRangePicker" class="components-view__card">
        <a-space direction="vertical" size="large" style="width: 100%">
          <p class="components-view__tip">用于演示受控日期区间选择，当前最大可选范围为 14 天。</p>
          <ProRangePicker v-model="dateRange" :day-range="14" format="YYYY-MM-DD" @change="handleRangeChange" />
          <div class="components-view__result">
            {{ dateRange ? `${dateRange[0]} ~ ${dateRange[1]}` : "暂未选择日期范围" }}
          </div>
        </a-space>
      </a-card>
    </div>

    <a-card title="最近操作" class="components-view__card">
      <ul class="components-view__log-list">
        <li v-for="item in operationLogs" :key="item" class="components-view__log-item">
          {{ item }}
        </li>
      </ul>
    </a-card>
  </section>
</template>

<style scoped lang="less">
.components-view {
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
    font-size: 15px;
    line-height: 1.7;
    color: #475569;

    code {
      padding: 2px 8px;
      border-radius: 999px;
      background: rgb(15 118 110 / 10%);
      color: #115e59;
      font-size: 13px;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px;
  }

  &__card {
    border-radius: 20px;
    :deep(.pro-input-storage) {
      .pro-input-storage__key,
      .pro-input-storage__value {
        width: 120px;
      }
    }
    :deep(.ant-radio-group) {
      display: flex;
      flex-direction: row;
    }

    :deep(.ant-card-body) {
      padding: 20px;
    }
  }

  &__tip {
    margin: 0;
    color: #64748b;
    font-size: 14px;
    line-height: 1.7;
  }

  &__result {
    min-height: 44px;
    padding: 12px 14px;
    border: 1px dashed #cbd5e1;
    border-radius: 14px;
    background: #f8fafc;
    color: #0f172a;
    font-size: 14px;
    line-height: 1.5;
  }

  &__log-list {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
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

  @media (max-width: 768px) {
    &__grid {
      grid-template-columns: 1fr;
    }

    &__title {
      font-size: 24px;
    }
  }
}
</style>
