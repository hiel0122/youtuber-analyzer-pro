import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        warning: "var(--warning)",
        destructive: "var(--destructive)",
        background: "var(--background)",
        foreground: "var(--secondary)",
        card: "var(--card)",
        "card-foreground": "var(--secondary)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted)",
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--ring)",
        popover: {
          DEFAULT: "var(--card)",
          foreground: "var(--secondary)",
        },
        sidebar: {
          DEFAULT: "var(--card)",
          foreground: "var(--secondary)",
          "muted-foreground": "var(--muted)",
          active: "var(--secondary)",
        },
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
          "6": "var(--chart-6)",
          "7": "var(--chart-7)",
          "8": "var(--chart-8)",
        },
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        lg: "calc(var(--radius) + 4px)",
        md: "var(--radius)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    { pattern: /(grid-cols|col-span|row-span|gap|p|px|py|pt|pb|pl|pr)-(1|2|3|4|5|6|8|10|12|16|20|24)/ },
    { pattern: /(w|h|min-w|min-h|max-w|max-h)-(full|screen|[0-9]+)$/ },
    { pattern: /^(bg|text|border|ring)-(primary|secondary|accent|warning|destructive|muted|card|background)$/ },
    { pattern: /^(fill|stroke)-(primary|accent|warning|destructive)$/ },
    { pattern: /(justify|items|content)-(start|center|end|between)/ },
    "bg-[var(--overlay,#0B1220)]/60",
    "bg-[var(--modal-bg,#0F1117)]",
    "backdrop-blur-md",
    "focus-visible:ring-[var(--brand-ink,#1D348F)]",
  ],
} satisfies Config;
