import React, { useMemo, useState } from "react";
import { VideoRow } from "@/lib/types";
import { formatMMDD } from "@/utils/format";
import { SectionCard } from "@/components/ui/card";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LabelList
} from "recharts";

type Point = { date: string; views: number };

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
    return Math.ceil(m * 1.02);
  }, [display]);

  if (loading) {
    return (
      <SectionCard title="조회수 추이">
        <div className="h-72 rounded-xl bg-muted/60 animate-pulse" />
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
          <span className="text-[11px] text-muted-foreground ml-1">최대 10일 표시</span>
        </div>
      }
    >
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={display} margin={{ top: 8, right: 8, bottom: 28, left: 8 }} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke="hsl(var(--border))" />
            {/* X축 숨김 */}
            <XAxis dataKey="date" hide />
            <YAxis domain={[0, maxY]} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              labelFormatter={(l) => `날짜: ${formatMMDD(l as string)}`}
              formatter={(v) => [(v as number).toLocaleString(), "조회수"]}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px'
              }}
            />
            {/* 막대 + 라벨 */}
            <Bar dataKey="views" fill="hsl(var(--primary))" barSize={28}>
              <LabelList 
                dataKey="dateLabel" 
                position="insideBottom" 
                offset={-4} 
                style={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
              />
              <LabelList 
                dataKey="views" 
                position="top" 
                formatter={(v: number) => v.toLocaleString()} 
                style={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} 
              />
            </Bar>
            {/* 선 + 점 */}
            <Line dataKey="views" stroke="hsl(var(--chart-2))" dot strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
