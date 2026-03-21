<script setup lang="ts">
// 404 页面
const router = useRouter();

function goHome() {
  router.push("/");
}
</script>

<template>
  <div class="not-found">
    <a-result status="404" title="404" sub-title="抱歉，您访问的页面不存在">
      <template #extra>
        <a-button type="primary" @click="goHome">返回首页</a-button>
      </template>
    </a-result>
  </div>
</template>

<style scoped lang="less">
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 134px);
  background: #f0f2f5;
}
</style>
