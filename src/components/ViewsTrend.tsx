import React, { useMemo, useState } from "react";
import { VideoRow } from "@/lib/types";
import { formatMMDD } from "@/utils/format";
import { formatNumber } from "@/lib/utils";
import { SectionCard } from "@/components/ui/card";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList
} from "recharts";

type Point = { date: string; views: number };

const TopLabel = (props: any) => {
  const { x = 0, y = 0, width = 0, value } = props;
  const cx = x + width / 2;
  // 상단 클리핑 방지: 최소 12px 안쪽으로
  const cy = Math.max(12, y - 8);
  return (
    <text x={cx} y={cy} textAnchor="middle" fill="#fff" fontSize={12}>
      {formatNumber(value as number)}
    </text>
  );
};

function buildDailySeries(videos: VideoRow[]): Point[] {
  const map = new Map<string, number>(); // YYYY-MM-DD -> sum views
  for (const v of videos) {
    const day = (v.upload_date ?? "").slice(0, 10);
    if (!day) continue;
    const views = v.views ?? 0;
    map.set(day, (map.get(day) ?? 0) + views);
  }
  const arr = Array.from(map.entries())
    .map(([date, views]) => ({ date, views }))
    .sort((a, b) => a.date.localeCompare(b.date)); // 과거 -> 최신
  return arr;
}

function filterByDays(series: Point[], days: number): Point[] {
  if (!series.length) return [];
  const lastDate = new Date(series[series.length - 1].date);
  const from = new Date(lastDate);
  from.setDate(from.getDate() - (days - 1));
  return series.filter(p => {
    const d = new Date(p.date);
    return d >= from && d <= lastDate;
  });
}

export default function ViewsTrend({ videos, loading }: { videos: VideoRow[]; loading: boolean }) {
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(7);

  const series = useMemo(() => buildDailySeries(videos), [videos]);
  const filtered = useMemo(() => filterByDays(series, rangeDays), [series, rangeDays]);

  // 최신이 오른쪽: 이미 과거->최신 정렬되어 있으니 그대로 사용
  // 최대 10일만 표시
  const display = useMemo(() => {
    const sliced = filtered.slice(-10);
    return sliced.map(p => ({
      ...p,
      dateLabel: formatMMDD(p.date),
    }));
  }, [filtered]);

  const maxY = useMemo(() => {
    const m = Math.max(0, ...display.map(p => p.views));
    return Math.ceil(m * 1.12);
  }, [display]);

  if (loading) {
    return (
      <SectionCard title="조회수 추이">
        <div className="h-72 rounded-xl bg-muted/60 animate-pulse" />
      </SectionCard>
    );
  }

  if (!videos || videos.length === 0 || display.length === 0) {
    return (
      <SectionCard title="조회수 추이">
        <div className="flex items-center justify-center h-72 text-sm text-muted-foreground">
          데이터가 없습니다.
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="조회수 추이"
      right={
        <div className="flex items-center gap-2">
          {[7,14,30].map((d) => (
            <button
              key={d}
              onClick={() => setRangeDays(d as 7|14|30)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${rangeDays===d ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
            >
              최근 {d}일
            </button>
          ))}
        </div>
      }
    >
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={display} margin={{ top: 28, right: 8, bottom: 36, left: 0 }} barCategoryGap={24}>
            <defs>
              <linearGradient id="viewsGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-green-400)" stopOpacity={0.9} />
                <stop offset="100%" stopColor="var(--chart-green-600)" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="dateLabel"
              angle={-35}
              textAnchor="end"
              height={28}
              tickMargin={12}
              padding={{ left: 8, right: 8 }}
              interval="preserveStartEnd"
            />
            <YAxis hide domain={[0, maxY]} />
            <Tooltip
              labelFormatter={(l) => `날짜: ${l}`}
              formatter={(v) => [formatNumber(v as number), "조회수"]}
              cursor={false}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="views" fill="url(#viewsGreen)" radius={[8, 8, 0, 0]}>
              <LabelList dataKey="views" content={<TopLabel />} />
            </Bar>
            <Line
              type="monotone"
              dataKey="views"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
