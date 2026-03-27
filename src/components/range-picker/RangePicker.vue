<script setup lang="ts">
import { ref } from "vue";
import { ProRangePicker } from "@pro-monorepo/components";

// 演示组件仍使用标准 v-model，方便验证组件库对外 API 是否符合 Vue 习惯。
const dateRange = ref<[string, string] | null>(null);

// 这里仅打印结果，实际业务中通常会联动查询参数或表单状态。
const handleChange = (value: [string, string] | null) => {
  console.log("选中的时间范围:", value);
};
</script>

<template>
  <div class="range-picker">
    <h3>日期范围选择</h3>
    <ProRangePicker v-model="dateRange" :day-range="30" format="YYYY-MM-DD" @change="handleChange" />
    <p v-if="dateRange" class="selected-range">已选择: {{ dateRange[0] }} ~ {{ dateRange[1] }}</p>
  </div>
</template>

<style scoped>
.range-picker {
  padding: 16px;
}

.range-picker h3 {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
}

.selected-range {
  margin-top: 12px;
  color: #666;
}
</style>
