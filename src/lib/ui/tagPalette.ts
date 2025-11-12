export const TAG_COLORS = [
  "#60A5FA", // blue
  "#34D399", // green
  "#F472B6", // pink
  "#F59E0B", // amber
  "#A78BFA", // violet
  "#22C55E", // emerald
  "#FB7185", // rose
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#F97316"  // orange
];

export function textOn(hex: string): string {
  // hex -> RGB
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  // 상대 휘도(단순화)로 가독성 텍스트 결정
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 160 ? "#0A0A0A" : "#FFFFFF"; // 밝으면 진한 글자, 어두우면 흰 글자
}

export const pickTagColor = (i: number) => TAG_COLORS[i % TAG_COLORS.length];
