import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

// Design tokens — change these to re-theme the whole site.
// bg:        deep space-navy, not pure black (avoids the generic #000 look)
// surface:   slightly elevated panels/cards
// accent:    electric blue — the single signature color, used sparingly
// accent-2:  cyan, reserved for code/syntax + secondary highlights
// signal:    amber, reserved ONLY for status/attention (build badges, warnings)
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./content/**/*.mdx",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#090c11",
          elevated: "#0f141c",
          panel: "#131922",
        },
        border: {
          DEFAULT: "#1d2530",
          subtle: "#161c25",
        },
        ink: {
          DEFAULT: "#e8edf3",
          muted: "#93a1b0",
          faint: "#5c6b7a",
        },
        accent: {
          DEFAULT: "#2f8bff",
          soft: "#8fc0ff",
          dim: "#173357",
        },
        cyan: {
          DEFAULT: "#22d3ee",
        },
        signal: {
          DEFAULT: "#f5a524",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      maxWidth: {
        prose: "70ch",
        page: "1180px",
      },
      typography: () => ({
        invert: {
          css: {
            "--tw-prose-body": "#c7d2dd",
            "--tw-prose-headings": "#e8edf3",
            "--tw-prose-links": "#2f8bff",
            "--tw-prose-bold": "#e8edf3",
            "--tw-prose-code": "#8fc0ff",
            "--tw-prose-quotes": "#93a1b0",
            "--tw-prose-quote-borders": "#1d2530",
            "--tw-prose-hr": "#1d2530",
            "--tw-prose-th-borders": "#1d2530",
            "--tw-prose-td-borders": "#161c25",
          },
        },
      }),
      keyframes: {
        "boot-line": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
      },
      animation: {
        "boot-line": "boot-line 0.4s ease-out both",
        blink: "blink 1s step-end infinite",
      },
    },
  },
  plugins: [typography],
};

export default config;
