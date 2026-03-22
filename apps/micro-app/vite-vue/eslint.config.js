import { defineConfig } from "eslint/config";
import { fileURLToPath } from "node:url";
import { createVueAppEslintConfig } from "@pro-monorepo/eslint-config";

const tsconfigRootDir = fileURLToPath(new URL(".", import.meta.url));

const autoImportGlobals = {
  ref: "readonly",
  computed: "readonly",
  watch: "readonly",
  watchEffect: "readonly",
  onMounted: "readonly",
  onUnmounted: "readonly",
  onBeforeMount: "readonly",
  onBeforeUnmount: "readonly",
  defineProps: "readonly",
  defineEmits: "readonly",
  defineExpose: "readonly",
  useRoute: "readonly",
  useRouter: "readonly"
};

export default defineConfig(createVueAppEslintConfig({ tsconfigRootDir, globalEntries: autoImportGlobals }));
