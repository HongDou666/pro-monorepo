<script setup lang="ts">
import { ProInputStorage } from "@pro-monorepo/components";

// 这个包装组件主要用于主应用首页演示组件库事件流，业务项目可直接使用 ProInputStorage。
const handleSet = (key: string, value: string) => {
  console.log("存储成功:", key, value);
};

// 删除事件与设置事件分开暴露，便于业务层分别做埋点或提示。
const handleRemove = (key: string) => {
  console.log("删除成功:", key);
};

// 组件内部校验失败时统一从 error 事件冒泡到外层。
const handleError = (message: string) => {
  console.error("操作失败:", message);
};
</script>

<template>
  <div class="input-storage">
    <h3>本地存储操作</h3>
    <ProInputStorage storage-type="local" @set="handleSet" @remove="handleRemove" @error="handleError" />
  </div>
</template>

<style scoped>
.input-storage {
  padding: 16px;
}

.input-storage h3 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
}
</style>
