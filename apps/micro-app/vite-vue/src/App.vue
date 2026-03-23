<template>
  <div class="sub-app-shell pro-micro-shell">
    <header class="sub-app-shell__header pro-micro-header">
      <div>
        <p class="sub-app-shell__eyebrow pro-eyebrow text-warning">vite-vue micro app</p>
        <h1 class="sub-app-shell__title pro-title">Vue 子应用</h1>
      </div>

      <nav class="sub-app-shell__nav">
        <RouterLink to="/" class="sub-app-shell__link">首页</RouterLink>
        <RouterLink to="/components" class="sub-app-shell__link">组件演示</RouterLink>
        <RouterLink to="/communication" class="sub-app-shell__link">通信面板</RouterLink>
      </nav>
    </header>

    <main class="sub-app-shell__main">
      <router-view />
    </main>
  </div>
</template>

<style scoped lang="less">
.sub-app-shell {
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  background: linear-gradient(180deg, #fffdf8 0%, #f8fafc 100%);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    max-width: 960px;
    margin: 0 auto 24px;
  }

  &__eyebrow {
    margin: 0 0 6px;
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #d97706;
  }

  &__title {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
    color: #0f172a;
  }

  &__nav {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__link {
    padding: 10px 16px;
    border-radius: 999px;
    color: #475569;
    text-decoration: none;
    background: rgb(148 163 184 / 12%);
    transition: all 0.2s ease;

    &:hover {
      color: #0f172a;
      background: rgb(148 163 184 / 20%);
    }

    &.router-link-active {
      color: #fff;
      background: #0f172a;
    }
  }

  &__main {
    max-width: 960px;
    margin: 0 auto;
  }

  @media (max-width: 768px) {
    &__header {
      align-items: flex-start;
      flex-direction: column;
    }

    &__title {
      font-size: 24px;
    }
  }
}
</style>
