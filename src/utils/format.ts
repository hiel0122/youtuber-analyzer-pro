export const formatInt = (n?: number | string | null) => {
  const num = typeof n === 'string' ? parseInt(n) : (n ?? 0);
  if (!Number.isFinite(num)) return '—';
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(num);
};

// Format number with optional dash for zero
export const formatIntOrDash = (n?: number | null, showDashForZero = false) => {
  if (n == null || !Number.isFinite(n)) return '—';
  if (n === 0 && showDashForZero) return '—';
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(n);
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
