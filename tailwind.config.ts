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
        app: {
          bg: "var(--bg)",
          surface: "var(--surface)",
          ink: "var(--ink)",
          muted: "var(--muted)",
          border: "var(--border)",
          primary: "var(--primary)",
          accent: "var(--accent)",
          warning: "var(--warning)",
          danger: "var(--danger)",
        },
        // Keep legacy tokens for compatibility
        background: "var(--bg)",
        foreground: "var(--ink)",
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--primary)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F1F5F9",
          foreground: "var(--ink)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "var(--muted)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "#FFFFFF",
        },
        popover: {
          DEFAULT: "var(--surface)",
          foreground: "var(--ink)",
        },
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--ink)",
        },
        sidebar: {
          DEFAULT: "var(--surface)",
          foreground: "var(--ink)",
          "muted-foreground": "var(--muted)",
          active: "var(--ink)",
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
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
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
    { pattern: /(text|bg|border)-(primary|secondary|accent|muted|foreground|background)/ },
    { pattern: /(justify|items|content)-(start|center|end|between)/ },
  ],
} satisfies Config;
