export const CHART_COLORS = [
  getComputedStyle(document.documentElement).getPropertyValue("--chart-1").trim() || "#2563EB",
  getComputedStyle(document.documentElement).getPropertyValue("--chart-2").trim() || "#14B8A6",
  getComputedStyle(document.documentElement).getPropertyValue("--chart-3").trim() || "#F59E0B",
  getComputedStyle(document.documentElement).getPropertyValue("--chart-4").trim() || "#0F172A",
  getComputedStyle(document.documentElement).getPropertyValue("--chart-5").trim() || "#93C5FD",
  getComputedStyle(document.documentElement).getPropertyValue("--chart-6").trim() || "#A78BFA",
  getComputedStyle(document.documentElement).getPropertyValue("--chart-7").trim() || "#34D399",
  getComputedStyle(document.documentElement).getPropertyValue("--chart-8").trim() || "#FB923C",
];

export const pickChartColor = (i: number) => CHART_COLORS[i % CHART_COLORS.length];

// Helper to get chart color by index with dynamic CSS variable resolution
export const getChartColor = (index: number): string => {
  const doc = document.documentElement;
  const vars = [
    "--chart-1", "--chart-2", "--chart-3", "--chart-4",
    "--chart-5", "--chart-6", "--chart-7", "--chart-8",
  ];
  const key = vars[index % vars.length];
  const val = getComputedStyle(doc).getPropertyValue(key).trim();
  return val || "#2563EB"; // fallback to primary blue
};
