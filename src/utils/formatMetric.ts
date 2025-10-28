type Numberish = number | null | undefined;

export interface FormatMetricOptions {
  showPlus?: boolean;   // 구독자 카드 등 + 필요할 때만
  zeroAsDash?: boolean; // '0이 의미 없는 칸'을 하이픈 처리
  isLoaded?: boolean;
  hasData?: boolean;
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

  const text = n.toLocaleString('ko-KR');

  // '+'는 명시적으로 요청한 경우에만, 그리고 값>0일 때만
  if (opts?.showPlus && n > 0) return `${text}+`;

  return text;
}
