export const formatInt = (n?: number | string) => {
  const num = typeof n === 'string' ? parseInt(n) : (n ?? 0);
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const formatMMDD = (iso: string) => {
  const d = new Date(iso);
  const mm = `${d.getMonth() + 1}`.padStart(2, "0");
  const dd = `${d.getDate()}`.padStart(2, "0");
  return `${mm}/${dd}`;
};

export const yTicks200kTo2M = Array.from({ length: 11 }, (_, i) => i * 200_000);

export const yTickLabel = (v: number) =>
  v >= 1_000_000 ? `${(v / 1_000_000).toFixed(v % 1_000_000 === 0 ? 0 : 1)}M`
  : v >= 1_000 ? `${(v / 1_000).toFixed(v % 1_000 === 0 ? 0 : 1)}K`
  : `${v}`;
