<script setup lang="ts">
// 微前端应用页面
const loading = ref(false);
</script>

<template>
  <div class="micro-app">
    <h1 class="micro-app__title">微前端应用</h1>
    <p class="micro-app__desc">管理和展示子应用</p>

    <div class="micro-app__content">
      <a-card title="快速操作" class="micro-app__card">
        <a-space direction="vertical" style="width: 100%">
          <a-button type="primary" :loading="loading">启动所有子应用</a-button>
          <a-button>停止所有子应用</a-button>
          <a-button danger>清除缓存</a-button>
        </a-space>
      </a-card>

      <a-card title="子应用" class="micro-app__card"> </a-card>
    </div>
  </div>
</template>

<style scoped lang="less">
.micro-app {
  padding: 24px;

  &__title {
    font-size: 28px;
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
    grid-template-columns: 200px 1fr;
    gap: 24px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &__card {
    margin-bottom: 16px;
  }
}
</style>
