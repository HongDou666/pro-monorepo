<script setup lang="ts">
import { ProInputStorage } from "@pro-monorepo/components";

const handleSet = (key: string, value: string) => {
  console.log("存储成功:", key, value);
};

const handleRemove = (key: string) => {
  console.log("删除成功:", key);
};

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
