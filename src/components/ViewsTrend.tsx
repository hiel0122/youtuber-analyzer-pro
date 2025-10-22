import React, { useMemo, useState } from "react";
import { VideoRow } from "@/lib/types";
import { formatMMDD } from "@/utils/format";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
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
    return sliced;
  }, [filtered]);

  const maxY = useMemo(() => {
    const m = Math.max(0, ...display.map(p => p.views));
    return Math.ceil(m * 1.02);
  }, [display]);

  if (loading) {
    return <div className="h-72 rounded-2xl bg-gray-900 animate-pulse" />;
  }

  return (
    <div className="rounded-2xl bg-gray-900 p-4">
      {/* 기간 버튼 */}
      <div className="mb-3 flex gap-2">
        {[7,14,30].map((d) => (
          <button
            key={d}
            onClick={() => setRangeDays(d as 7|14|30)}
            className={`px-3 py-1 rounded-full text-sm ${rangeDays===d ? "bg-purple-600" : "bg-gray-800 hover:bg-gray-700"}`}
          >
            최근 {d}일
          </button>
        ))}
        <div className="text-xs text-gray-400 ml-auto">최대 10일만 표시</div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={display}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            {/* X축: 날짜 mm/dd, 라벨 기울이기 */}
            <XAxis
              dataKey="date"
              tickFormatter={formatMMDD}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            {/* Y축: 조회수, 0 ~ max*1.02 */}
            <YAxis domain={[0, maxY]} />
            <Tooltip formatter={(value) => value.toLocaleString()} labelFormatter={(l) => `날짜: ${formatMMDD(l as string)}`} />
            {/* 막대 + 선(점 포함) */}
            <Bar dataKey="views" fill="#8b5cf6" barSize={24} />
            <Line dataKey="views" stroke="#10b981" dot strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
