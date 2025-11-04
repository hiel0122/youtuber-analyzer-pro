export const CHART_COLORS = Array.from({ length: 8 }, (_, i) => {
  const k = `--chart-${i + 1}`;
  const v = getComputedStyle(document.documentElement).getPropertyValue(k).trim();
  return v || ['#2563EB','#14B8A6','#F59E0B','#93C5FD','#A78BFA','#34D399','#FB923C','#6B7280'][i];
});

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
