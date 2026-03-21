<script setup lang="ts">
import { ref } from "vue";
import { ProRangePicker } from "@pro-monorepo/components";

const dateRange = ref<[string, string] | null>(null);

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
