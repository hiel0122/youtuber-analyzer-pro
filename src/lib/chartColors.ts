export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

// Helper to get chart color by index
export const getChartColor = (index: number): string => {
  return CHART_COLORS[index % CHART_COLORS.length];
};
