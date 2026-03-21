<script setup lang="ts">
/**
 * 微前端应用页面
 * 使用 micro-app 加载子应用
 */

// 当前选中的子应用
const currentApp = ref<"vite-vue" | "vite-react">("vite-vue");

// 子应用配置
const microApps = {
  "vite-vue": {
    name: "vite-vue",
    url: "http://localhost:5174/"
  },
  "vite-react": {
    name: "vite-react",
    url: "http://localhost:5175/"
  }
};

// 子应用加载状态
const loading = ref(false);

// 子应用加载完成
function handleMounted() {
  loading.value = false;
  console.log(`[MicroApp] ${currentApp.value} 加载完成`);
}

// 子应用加载错误
function handleError() {
  loading.value = false;
  console.error(`[MicroApp] ${currentApp.value} 加载失败`);
}
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
  padding: 12px;
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
    min-height: 500px;
    overflow: auto;

    micro-app {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
