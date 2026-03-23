import {
  defineConfig,
  presetAttributify,
  presetTypography,
  presetUno,
  transformerDirectives,
  transformerVariantGroup
} from "unocss";

const sharedTheme = {
  colors: {
    brand: {
      DEFAULT: "#2563eb",
      soft: "#dbeafe",
      deep: "#1d4ed8"
    },
    ink: {
      DEFAULT: "#0f172a",
      muted: "#475569",
      soft: "#64748b"
    },
    line: "#e2e8f0",
    surface: {
      DEFAULT: "#ffffff",
      muted: "#f8fafc",
      warm: "#fff7ed"
    },
    success: "#059669",
    warning: "#d97706",
    danger: "#dc2626"
  },
  boxShadow: {
    card: "0 12px 32px rgb(15 23 42 / 6%)",
    shell: "0 18px 50px rgb(15 23 42 / 8%)"
  },
  borderRadius: {
    panel: "24px",
    pill: "999px"
  },
  fontFamily: {
    sans: ["PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "system-ui", "sans-serif"],
    mono: ["SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
  },
  maxWidth: {
    shell: "960px"
  }
};

const sharedShortcuts = {
  "pro-shell-page": "min-h-screen box-border bg-surface-muted px-5 py-6 text-ink md:px-8",
  "pro-shell-container": "mx-auto w-full max-w-shell",
  "pro-panel": "rounded-panel border border-line bg-surface shadow-card",
  "pro-panel-muted": "rounded-panel border border-line bg-surface-muted shadow-card",
  "pro-nav-pill": "rounded-pill px-4 py-2.5 no-underline transition-all duration-200",
  "pro-eyebrow": "m-0 text-xs uppercase tracking-[0.12em] text-ink-soft",
  "pro-title": "m-0 text-[28px] leading-tight font-600 tracking-tight text-ink md:text-3xl",
  "pro-desc": "m-0 text-[15px] leading-7 text-ink-muted"
};

export function createMonorepoUnoConfig(overrides = {}) {
  const { theme = {}, shortcuts = {}, presets = [], transformers = [], content, ...rest } = overrides;

  return defineConfig({
    theme: {
      ...sharedTheme,
      ...theme,
      colors: {
        ...sharedTheme.colors,
        ...(theme.colors ?? {})
      },
      boxShadow: {
        ...sharedTheme.boxShadow,
        ...(theme.boxShadow ?? {})
      },
      borderRadius: {
        ...sharedTheme.borderRadius,
        ...(theme.borderRadius ?? {})
      },
      fontFamily: {
        ...sharedTheme.fontFamily,
        ...(theme.fontFamily ?? {})
      },
      maxWidth: {
        ...sharedTheme.maxWidth,
        ...(theme.maxWidth ?? {})
      }
    },
    shortcuts: {
      ...sharedShortcuts,
      ...shortcuts
    },
    presets: [presetUno(), presetAttributify(), presetTypography(), ...presets],
    transformers: [transformerDirectives(), transformerVariantGroup(), ...transformers],
    content,
    ...rest
  });
}

export default createMonorepoUnoConfig;
