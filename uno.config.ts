import { createMonorepoUnoConfig } from "@pro-monorepo/unocss-config";

export default createMonorepoUnoConfig({
  shortcuts: {
    "pro-dashboard-hero": "pro-panel relative overflow-hidden px-8 py-7",
    "pro-dashboard-grid": "grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"
  }
});
