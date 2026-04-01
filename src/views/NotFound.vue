<script setup lang="ts">
// 404 页面
const router = useRouter();

function goHome() {
  router.push("/");
}
</script>

<template>
  <div class="not-found">
    <div class="not-found__panel">
      <p class="not-found__code">404</p>
      <h1 class="not-found__title">页面不存在</h1>
      <p class="not-found__desc">抱歉，您访问的页面不存在。</p>
      <a-button type="primary" @click="goHome">返回首页</a-button>
    </div>
  </div>
</template>

<style scoped lang="less">
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 134px);
  background: #f0f2f5;

  &__panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: min(420px, calc(100vw - 32px));
    padding: 40px 28px;
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    background: #fff;
    text-align: center;
    box-shadow: 0 18px 40px rgb(15 23 42 / 8%);
  }

  &__code {
    margin: 0;
    color: #6366f1;
    font-size: 52px;
    font-weight: 700;
    line-height: 1;
  }

  &__title {
    margin: 12px 0 0;
    color: #0f172a;
    font-size: 24px;
    font-weight: 600;
  }

  &__desc {
    margin: 10px 0 24px;
    color: #64748b;
    font-size: 14px;
    line-height: 1.7;
  }
}
</style>
