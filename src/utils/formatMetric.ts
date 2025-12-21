type Numberish = number | null | undefined;

export interface FormatMetricOptions {
  showPlus?: boolean;   // 구독자 카드 등 + 필요할 때만
  zeroAsDash?: boolean; // '0이 의미 없는 칸'을 하이픈 처리
  isLoaded?: boolean;
  hasData?: boolean;
  compact?: boolean;    // 큰 숫자를 K/M/B로 축약
}

/**
 * 큰 숫자를 K/M/B 형태로 축약
 */
export function formatCompact(n: number): string {
  if (n >= 1_000_000_000) {
    return `${(n / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  }
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return n.toLocaleString('ko-KR');
}

export function formatMetric(
  v: Numberish,
  opts?: FormatMetricOptions
): string {
  const loaded = opts?.isLoaded ?? true;
  const dataOk = opts?.hasData ?? true;

  // 분석 전/무데이터 → 항상 하이픈
  if (!loaded || !dataOk) return '—';

  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—';

  const n = Math.trunc(Number(v));

  if (opts?.zeroAsDash && n === 0) return '—';

  // compact 옵션이 true이거나 숫자가 100만 이상이면 축약
  const shouldCompact = opts?.compact ?? (n >= 1_000_000);
  const text = shouldCompact ? formatCompact(n) : n.toLocaleString('ko-KR');

  // '+'는 명시적으로 요청한 경우에만, 그리고 값>0일 때만
  if (opts?.showPlus && n > 0) return `${text}+`;

  return text;
}
