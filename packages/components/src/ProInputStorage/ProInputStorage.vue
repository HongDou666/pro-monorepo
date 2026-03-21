<script setup lang="ts">
import { ref } from "vue";
import { Input, Button, Radio, message } from "ant-design-vue";
import { setStorage, removeStorage } from "@pro-monorepo/utils";

/** 操作模式 */
type ModeType = "set" | "remove";

/** Props 定义 */
const props = withDefaults(
  defineProps<{
    /** 存储类型：local 或 session */
    storageType?: "local" | "session";
    /** 存储键名占位符 */
    keyPlaceholder?: string;
    /** 存储值占位符 */
    valuePlaceholder?: string;
    /** 存储按钮文字 */
    setButtonText?: string;
    /** 删除按钮文字 */
    removeButtonText?: string;
    /** 是否显示操作模式切换 */
    showModeSwitch?: boolean;
    /** 默认操作模式 */
    defaultMode?: ModeType;
  }>(),
  {
    storageType: "local",
    keyPlaceholder: "请输入键名",
    valuePlaceholder: "请输入值",
    setButtonText: "存储",
    removeButtonText: "删除",
    showModeSwitch: true,
    defaultMode: "set"
  }
);

/** Emits 定义 */
const emit = defineEmits<{
  (e: "set", key: string, value: string): void;
  (e: "remove", key: string): void;
  (e: "error", message: string): void;
}>();

/** 当前操作模式 */
const mode = ref<ModeType>(props.defaultMode);

/** 键名输入 */
const keyInput = ref<string>("");

/** 值输入 */
const valueInput = ref<string>("");

/** 处理存储操作 */
const handleSet = () => {
  const key = keyInput.value.trim();
  const value = valueInput.value.trim();

  if (!key) {
    message.warning("请输入键名");
    emit("error", "请输入键名");

    return;
  }

  if (!value) {
    message.warning("请输入值");
    emit("error", "请输入值");

    return;
  }

  try {
    setStorage(key, value, { type: props.storageType });
    message.success("存储成功");
    emit("set", key, value);

    // 清空输入
    keyInput.value = "";
    valueInput.value = "";
  } catch {
    const errorMsg = "存储失败";

    message.error(errorMsg);
    emit("error", errorMsg);
  }
};

/** 处理删除操作 */
const handleRemove = () => {
  const key = keyInput.value.trim();

  if (!key) {
    message.warning("请输入键名");
    emit("error", "请输入键名");

    return;
  }

  try {
    removeStorage(key, { type: props.storageType });
    message.success("删除成功");
    emit("remove", key);

    // 清空输入
    keyInput.value = "";
  } catch {
    const errorMsg = "删除失败";

    message.error(errorMsg);
    emit("error", errorMsg);
  }
};

/** 处理按钮点击 */
const handleClick = () => {
  if (mode.value === "set") {
    handleSet();
  } else {
    handleRemove();
  }
};

/** 模式切换事件处理 */
const handleModeChange = (e: { target: { value: ModeType } }) => {
  mode.value = e.target.value;
  // 切换模式时清空输入
  keyInput.value = "";
  valueInput.value = "";
};
</script>

<template>
  <div class="pro-input-storage">
    <!-- 操作模式切换 -->
    <div v-if="showModeSwitch" class="pro-input-storage__mode">
      <Radio.Group :value="mode" @change="handleModeChange">
        <Radio.Button value="set">{{ setButtonText }}</Radio.Button>
        <Radio.Button value="remove">{{ removeButtonText }}</Radio.Button>
      </Radio.Group>
    </div>

    <!-- 输入区域 -->
    <div class="pro-input-storage__content">
      <!-- 键名输入 -->
      <Input v-model:value="keyInput" :placeholder="keyPlaceholder" allow-clear class="pro-input-storage__key" />

      <!-- 值输入（仅在存储模式显示） -->
      <Input
        v-if="mode === 'set'"
        v-model:value="valueInput"
        :placeholder="valuePlaceholder"
        allow-clear
        class="pro-input-storage__value"
      />

      <!-- 操作按钮 -->
      <Button type="primary" @click="handleClick">
        {{ mode === "set" ? setButtonText : removeButtonText }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
.pro-input-storage {
  display: inline-flex;
  flex-direction: column;
  gap: 12px;
}

.pro-input-storage__mode {
  display: flex;
  justify-content: flex-start;
}

.pro-input-storage__content {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pro-input-storage__key {
  width: 200px;
}

.pro-input-storage__value {
  width: 200px;
}
</style>
