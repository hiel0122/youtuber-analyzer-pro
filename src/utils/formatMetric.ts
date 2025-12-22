type Numberish = number | null | undefined;

export interface FormatMetricOptions {
  showPlus?: boolean;   // 구독자 카드 등 + 필요할 때만
  zeroAsDash?: boolean; // '0이 의미 없는 칸'을 하이픈 처리
  isLoaded?: boolean;
  hasData?: boolean;
  compact?: boolean;    // 큰 숫자를 K/M/B로 축약
}

/**
 * 큰 숫자를 한국식 단위(억, 만)로 축약
 */
export function formatCompact(n: number): string {
  if (n >= 100_000_000) {
    // 1억 이상
    const eok = n / 100_000_000;
    if (eok >= 10) {
      return `${Math.floor(eok).toLocaleString('ko-KR')}억`;
    }
    return `${eok.toFixed(1).replace(/\.0$/, '')}억`;
  }
  if (n >= 10_000) {
    // 1만 이상
    const man = Math.floor(n / 10_000);
    return `${man.toLocaleString('ko-KR')}만`;
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
