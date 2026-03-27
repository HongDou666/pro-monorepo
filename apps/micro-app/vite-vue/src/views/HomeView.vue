<template>
  <section class="home-view">
    <div class="home-view__panel">
      <p class="home-view__eyebrow">Lightweight entry</p>
      <h2 class="home-view__title">首页首包只保留轻量内容</h2>
      <p class="home-view__desc">
        通信页已经通过路由懒加载拆成异步 chunk，只有进入“通信面板”时才会加载 antd 组件和通信逻辑。
      </p>
      <p class="home-view__desc home-view__desc--extra">
        现在还新增了“请求示例”页面，用于演示 Vue 子应用复用共享 axios 公共包。
      </p>
      <p class="home-view__desc home-view__desc--extra">
        这个首页本身刻意保持简单，主要用于强调“子应用入口尽量轻量化”的微前端实践。
      </p>
    </div>
  </section>
</template>

<style scoped lang="less">
.home-view {
  &__panel {
    padding: 28px;
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    background: #fff;
    box-shadow: 0 12px 32px rgb(15 23 42 / 6%);
  }

  &__eyebrow {
    margin: 0 0 8px;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #d97706;
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

    &--extra {
      margin-top: 12px;
    }
  }
}
</style>
