export const YAP_CHART_COLORS = [
  "#22c55e", // green
  "#ec4899", // pink
  "#38bdf8", // sky
  "#f59e0b", // amber
  "#a78bfa", // violet
  "#ef4444", // red
  "#14b8a6", // teal
  "#f97316", // orange
  "#84cc16", // lime
  "#06b6d4"  // cyan
];

export const pickColor = (i: number) => YAP_CHART_COLORS[i % YAP_CHART_COLORS.length];
