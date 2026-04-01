<script setup lang="ts">
import { ref } from "vue";
import message from "ant-design-vue/es/message";
import Button from "ant-design-vue/es/button";
import Input from "ant-design-vue/es/input";
import Radio from "ant-design-vue/es/radio";
import type { RadioChangeEvent } from "ant-design-vue/es/radio";
import { setStorage, removeStorage } from "@pro-monorepo/utils";

/**
 * 输入式存储操作组件。
 *
 * 设计目标：
 * 1. 用最少字段完成 localStorage / sessionStorage 的设置与删除。
 * 2. 将输入校验、提示文案和事件回调收口在组件内。
 * 3. 对外暴露清晰的 set/remove/error 事件，便于业务做埋点或二次提示。
 */

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

  // key 为空时直接终止，避免写入空键污染浏览器存储空间。
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
    // 组件只负责字符串值输入；更复杂的数据结构可由业务层自行序列化后传入。
    setStorage(key, value, { type: props.storageType });
    message.success("存储成功");
    emit("set", key, value);

    // 操作成功后清空输入，便于连续演示和避免用户误以为还未提交。
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

  // 删除动作只需要 key，因此 remove 模式下不会要求 valueInput。
  if (!key) {
    message.warning("请输入键名");
    emit("error", "请输入键名");

    return;
  }

  try {
    removeStorage(key, { type: props.storageType });
    message.success("删除成功");
    emit("remove", key);

    // 删除后保留空白态，避免连续误删同一个 key。
    keyInput.value = "";
  } catch {
    const errorMsg = "删除失败";

    message.error(errorMsg);
    emit("error", errorMsg);
  }
};

/** 处理按钮点击 */
const handleClick = () => {
  // 统一在这里分发动作，模板层只绑定一个按钮事件，降低分支复杂度。
  if (mode.value === "set") {
    handleSet();
  } else {
    handleRemove();
  }
};

/** 模式切换事件处理 */
const handleModeChange = (e: RadioChangeEvent) => {
  const nextMode = e.target.value;

  if (nextMode !== "set" && nextMode !== "remove") {
    return;
  }

  mode.value = nextMode;

  // 切换模式时清空输入，避免“删除模式误带旧 value”或“存储模式误复用旧 key/value”。
  keyInput.value = "";
  valueInput.value = "";
};
</script>

<template>
  <div class="pro-input-storage">
    <!--
      模式切换是可选能力。
      某些业务只需要固定做 set 或 remove，这时可以通过 showModeSwitch 隐藏切换。
    -->
    <div v-if="showModeSwitch" class="pro-input-storage__mode">
      <Radio.Group :value="mode" @change="handleModeChange">
        <Radio.Button value="set">{{ setButtonText }}</Radio.Button>
        <Radio.Button value="remove">{{ removeButtonText }}</Radio.Button>
      </Radio.Group>
    </div>

    <!-- 输入区根据 mode 动态裁剪字段，避免 remove 模式展示无意义的值输入框。 -->
    <div class="pro-input-storage__content">
      <Input v-model:value="keyInput" :placeholder="keyPlaceholder" allow-clear class="pro-input-storage__key" />

      <!-- value 只在 set 模式出现，因为删除动作不需要输入值。 -->
      <Input
        v-if="mode === 'set'"
        v-model:value="valueInput"
        :placeholder="valuePlaceholder"
        allow-clear
        class="pro-input-storage__value"
      />

      <!-- 按钮文案跟随当前模式变化，保持操作语义直观。 -->
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
