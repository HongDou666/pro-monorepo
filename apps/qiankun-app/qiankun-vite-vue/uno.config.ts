import { createMonorepoUnoConfig } from "@pro-monorepo/unocss-config";

export default createMonorepoUnoConfig({
  shortcuts: {
    "pro-micro-shell": "pro-shell-page bg-[linear-gradient(180deg,#fffdf8_0%,#f8fafc_100%)]",
    "pro-micro-header": "pro-shell-container mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
  }
});
