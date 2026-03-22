import { defineConfig } from "eslint/config";
import { fileURLToPath } from "node:url";
import { createReactAppEslintConfig } from "@pro-monorepo/eslint-config";

const tsconfigRootDir = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig(createReactAppEslintConfig({ tsconfigRootDir }));
