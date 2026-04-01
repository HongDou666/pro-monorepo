<script setup lang="ts">
import { ref, watch } from "vue";
import DatePicker from "ant-design-vue/es/date-picker";
import type { Dayjs } from "dayjs";
import dayjs, { isDayjs } from "dayjs";
/**
 * 带日期跨度限制的范围选择组件。
 *
 * 相比直接使用 antd 的 RangePicker，这里额外提供：
 * 1. dayRange 约束，限制用户最多选择多少天。
 * 2. 字符串型 v-model，方便直接和查询参数、表单值对接。
 * 3. 标准 change 事件，同时把格式化结果和原始 dayjs 对象一起暴露。
 */

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

const { RangePicker } = DatePicker;

type RangePickerChangeValue = [string, string] | [Dayjs, Dayjs];

/** 内部日期值 */
const dateValue = ref<[Dayjs, Dayjs] | null>(null);

function isDayjsRange(value: unknown): value is [Dayjs, Dayjs] {
  return Array.isArray(value) && value.length === 2 && isDayjs(value[0]) && isDayjs(value[1]);
}

/** 同步外部 modelValue */
watch(
  () => props.modelValue,
  newVal => {
    // 组件内部始终以 dayjs 对象工作，对外再转换成字符串，兼顾 UI 和业务层使用习惯。
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
  // 未选中起始日期前不做限制，让用户可以自由决定第一天。
  if (!dateValue.value || !dateValue.value[0]) {
    return false;
  }

  const startDate = dateValue.value[0];
  const diffDays = Math.abs(current.diff(startDate, "day"));

  // 一旦选中起点，后续可选日期范围会被限制在 dayRange 内。
  return diffDays > props.dayRange;
};

/** 处理日期变化 */
const handleChange = (value: RangePickerChangeValue | null | undefined) => {
  if (isDayjsRange(value)) {
    dateValue.value = value;

    // 对外统一输出格式化字符串，避免业务层重复处理 dayjs -> string 的转换。
    const result: [string, string] = [value[0].format(props.format), value[1].format(props.format)];

    emit("update:modelValue", result);
    emit("change", result, value);
  } else {
    dateValue.value = null;

    // 清空时同时清掉 v-model 和 change 事件值，保持受控语义一致。
    emit("update:modelValue", null);
    emit("change", null, null);
  }
};

/** 处理日历面板变化（用于限制日期范围） */
const handleCalendarChange = (value: unknown) => {
  // 用户只选中起始日期时也要先记录下来，disabledDate 才能据此限制后续日期。
  if (Array.isArray(value) && value.length === 2 && isDayjs(value[0])) {
    dateValue.value = isDayjs(value[1]) ? [value[0], value[1]] : [value[0], value[0]];
  }
};
</script>

<template>
  <div class="pro-range-picker">
    <!--
      这里直接复用 antd RangePicker 的外观与交互，
      组件自身主要补充范围限制和字符串值同步这两层能力。
    -->
    <RangePicker
      :value="dateValue ?? undefined"
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
