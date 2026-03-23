<script setup lang="ts">
// 首页 - 演示自动导入功能
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
}
</style>
