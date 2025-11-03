export const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

// Helper to get chart color by index with dynamic CSS variable resolution
export const getChartColor = (index: number): string => {
  const doc = document.documentElement;
  const vars = [
    "--chart-1", "--chart-2", "--chart-3", "--chart-4",
    "--chart-5", "--chart-6", "--chart-7", "--chart-8",
  ];
  const key = vars[index % vars.length];
  const val = getComputedStyle(doc).getPropertyValue(key).trim();
  return val || "#2563eb"; // fallback to blue
};
