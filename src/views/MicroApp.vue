<script setup lang="ts">
import type { SizeType } from "ant-design-vue/es/config-provider";
const size = ref<SizeType>("large");
</script>

<template>
  <div class="micro-app">
    <h1 class="micro-app__title">微前端应用</h1>
    <p class="micro-app__desc">管理和展示子应用</p>

    <div class="micro-app__content">
      <a-card title="快速操作" class="micro-app__card">
        <a-space direction="vertical" style="width: 100%">
          <a-radio-group v-model:value="size">
            <a-radio-button value="large">Large</a-radio-button>
            <a-radio-button value="default">Default</a-radio-button>
            <a-radio-button value="small">Small</a-radio-button>
          </a-radio-group>
        </a-space>
      </a-card>

      <a-card title="子应用" class="micro-app__card"> </a-card>
    </div>
  </div>
</template>

<style scoped lang="less">
.micro-app {
  display: flex;
  flex: 1;
  flex-direction: column;
  box-sizing: border-box;
  padding: 12px;
  min-height: 100%;

  &__title {
    font-size: 22px;
    font-weight: 600;
    color: #1890ff;
    margin-bottom: 8px;
  }

  &__desc {
    color: #666;
    margin-bottom: 24px;
  }

  &__content {
    display: grid;
    flex: 1;
    align-content: start;
    grid-template-columns: 200px 1fr;
    grid-template-rows: 1fr;
    gap: 24px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &__card {
    margin-bottom: 16px;
    :deep(.ant-radio-group) {
      display: flex;
      flex-direction: column;
      gap: 10px;
      > label {
        border-radius: 0;
      }
    }
  }
}
</style>
