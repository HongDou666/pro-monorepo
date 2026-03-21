<script setup lang="ts">
// 首页 - 演示自动导入功能
</script>

<template>
  <div class="home">
    <h1 class="home__title">首页</h1>
    <p class="home__desc">欢迎来到 Pro Monorepo 项目</p>

    <div class="home__content">
      <a-card title="packages 物料组件演示" class="home__card">
        <a-space direction="vertical">
          <InputStorage />
          <RangePicker />
        </a-space>
      </a-card>

      <a-card title="项目特性" class="home__card">
        <a-list
          :data-source="[
            { title: 'Vue 3 + TypeScript', desc: '现代化的前端技术栈' },
            { title: 'Vite 构建', desc: '极速的开发体验' },
            { title: 'Monorepo 架构', desc: '统一管理多个包' },
            { title: '自动导入', desc: 'API 和组件自动注册' }
          ]"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta :title="item.title" :description="item.desc" />
            </a-list-item>
          </template>
        </a-list>
      </a-card>
    </div>
  </div>
</template>

<style scoped lang="less">
.home {
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
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
}
</style>
