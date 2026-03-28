<template>
  <section class="home-view">
    <div class="home-view__panel">
      <p class="home-view__eyebrow">Lightweight entry</p>
      <h2 class="home-view__title">首页首包只保留轻量内容</h2>
      <p class="home-view__desc">
        <!--
          首页文案优先解释为什么子应用首屏需要保持轻量：
          qiankun 托管时，主应用是否能快速渲染容器，直接取决于子应用入口阶段的复杂度。
        -->
        当前子应用以 qiankun 生命周期输出，首页只保留轻量入口内容，避免主应用容器首次挂载时等待过久。
      </p>
      <p class="home-view__desc home-view__desc--extra">
        <!--
          真正的交互能力拆到二级路由里：
          通信面板演示主子应用数据同步，请求示例演示共享 axios 能力复用。
        -->
        现在还新增了“通信面板”和“请求示例”页面，用于演示 Vue 子应用与主应用通信，以及复用共享 axios 公共包。
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
