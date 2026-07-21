import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Legacy aliases — kept so any not-yet-migrated file still renders
        // correctly (and stays dark-mode-correct) via the same tokens below.
        cream: "rgb(var(--color-bg) / <alpha-value>)",
        ink: "rgb(var(--color-text) / <alpha-value>)",
        herb: "rgb(var(--color-primary) / <alpha-value>)",
        citrus: "rgb(var(--color-secondary) / <alpha-value>)",

        bg: "rgb(var(--color-bg) / <alpha-value>)",
        surface: "rgb(var(--color-surface) / <alpha-value>)",
        "surface-elevated": "rgb(var(--color-surface-elevated) / <alpha-value>)",
        border: "rgb(var(--color-border) / <alpha-value>)",
        text: "rgb(var(--color-text) / <alpha-value>)",
        "muted-text": "rgb(var(--color-muted-text) / <alpha-value>)",
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        "primary-foreground": "rgb(var(--color-primary-foreground) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        "secondary-foreground": "rgb(var(--color-secondary-foreground) / <alpha-value>)",
        success: "rgb(var(--color-success) / <alpha-value>)",
        "success-surface": "rgb(var(--color-success-surface) / <alpha-value>)",
        warning: "rgb(var(--color-warning) / <alpha-value>)",
        "warning-surface": "rgb(var(--color-warning-surface) / <alpha-value>)",
        error: "rgb(var(--color-error) / <alpha-value>)",
        "error-surface": "rgb(var(--color-error-surface) / <alpha-value>)",
        info: "rgb(var(--color-info) / <alpha-value>)",
        "info-surface": "rgb(var(--color-info-surface) / <alpha-value>)",
        ring: "rgb(var(--color-ring) / <alpha-value>)",
      },
      borderRadius: {
        sm: "0.5rem",
        DEFAULT: "0.75rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
