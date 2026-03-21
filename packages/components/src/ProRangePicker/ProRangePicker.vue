<script setup lang="ts">
import { ref, watch } from "vue";
import { DatePicker } from "ant-design-vue";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

/** Props 定义 */
const props = withDefaults(
  defineProps<{
    /** 限制最多可以选择几天 */
    dayRange?: number;
    /** 当前选择的时间范围 */
    modelValue?: [string, string] | null;
    /** 占位符 */
    placeholder?: [string, string];
    /** 是否禁用 */
    disabled?: boolean;
    /** 是否允许清除 */
    allowClear?: boolean;
    /** 日期格式 */
    format?: string;
  }>(),
  {
    dayRange: 30,
    modelValue: null,
    placeholder: () => ["开始日期", "结束日期"],
    disabled: false,
    allowClear: true,
    format: "YYYY-MM-DD"
  }
);

/** Emits 定义 */
const emit = defineEmits<{
  (e: "update:modelValue", value: [string, string] | null): void;
  (e: "change", value: [string, string] | null, dates: [Dayjs, Dayjs] | null): void;
}>();

/** 内部日期值 */
const dateValue = ref<[Dayjs, Dayjs] | null>(null);

/** 同步外部 modelValue */
watch(
  () => props.modelValue,
  newVal => {
    if (newVal && newVal[0] && newVal[1]) {
      dateValue.value = [dayjs(newVal[0]), dayjs(newVal[1])];
    } else {
      dateValue.value = null;
    }
  },
  { immediate: true }
);

/** 禁用日期函数 */
const disabledDate = (current: Dayjs) => {
  if (!dateValue.value || !dateValue.value[0]) {
    return false;
  }

  const startDate = dateValue.value[0];
  const diffDays = Math.abs(current.diff(startDate, "day"));

  // 限制选择范围
  return diffDays > props.dayRange;
};

/** 处理日期变化 */
const handleChange = (dates: [Dayjs, Dayjs] | null) => {
  dateValue.value = dates;

  if (dates && dates[0] && dates[1]) {
    const result: [string, string] = [dates[0].format(props.format), dates[1].format(props.format)];

    emit("update:modelValue", result);
    emit("change", result, dates);
  } else {
    emit("update:modelValue", null);
    emit("change", null, null);
  }
};

/** 处理日历面板变化（用于限制日期范围） */
const handleCalendarChange = (dates: [Dayjs, Dayjs] | null) => {
  if (dates && dates[0]) {
    dateValue.value = dates;
  }
};
</script>

<template>
  <div class="pro-range-picker">
    <DatePicker.RangePicker
      :value="dateValue"
      :disabled-date="disabledDate"
      :placeholder="placeholder"
      :disabled="disabled"
      :allow-clear="allowClear"
      :format="format"
      @change="handleChange"
      @calendar-change="handleCalendarChange"
    />
  </div>
</template>

<style scoped>
.pro-range-picker {
  display: inline-block;
}
</style>
