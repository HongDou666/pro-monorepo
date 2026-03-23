import { createMonorepoUnoConfig } from "@pro-monorepo/unocss-config";

export default createMonorepoUnoConfig({
  shortcuts: {
    "pro-react-shell": "pro-shell-page bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_100%)]",
    "pro-react-fallback": "pro-panel mx-auto px-8 py-8 text-center text-ink-muted"
  }
});
