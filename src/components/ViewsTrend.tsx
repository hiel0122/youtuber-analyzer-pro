import React, { useMemo, useState } from "react";
import { VideoRow } from "@/lib/types";
import { formatMMDD, formatInt } from "@/utils/format";
import { formatNumber } from "@/lib/utils";
import { SectionCard } from "@/components/ui/card";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList
} from "recharts";

interface ViewsTrendProps {
  videos: VideoRow[];
  loading?: boolean;
  channelTotalViews?: number;
}

type Point = { date: string; views: number };

// 영상 길이 포맷팅 함수 (PT11M32S -> 11:32)
function formatDuration(duration: string | null): string {
  if (!duration) return "0:00";
  
  if (/^\d+:\d+$/.test(duration) || /^\d+:\d+:\d+$/.test(duration)) {
    return duration;
  }
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "0:00";
  
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const TopLabel = (props: any) => {
  const { x = 0, y = 0, width = 0, value } = props;
  const cx = x + width / 2;
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

export default function ViewsTrend({ videos, loading, channelTotalViews }: ViewsTrendProps) {
  const [rangeDays, setRangeDays] = useState<7 | 14 | 30>(7);

  const series = useMemo(() => buildDailySeries(videos), [videos]);
  const filtered = useMemo(() => filterByDays(series, rangeDays), [series, rangeDays]);

  // 조회수 기준으로 정렬하여 순위 계산
  const sortedByViews = useMemo(() => 
    [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)), 
    [videos]
  );
  
  const videoRankMap = useMemo(() => 
    new Map(sortedByViews.map((video, index) => [video.title, index + 1])),
    [sortedByViews]
  );

  // 전체 채널 조회수 계산
  const totalViews = useMemo(() => 
    channelTotalViews && channelTotalViews > 0
      ? channelTotalViews
      : videos.reduce((sum, v) => sum + (v.views || 0), 0),
    [channelTotalViews, videos]
  );

  // 최신이 오른쪽: 이미 과거->최신 정렬되어 있으니 그대로 사용
  // 최대 10일만 표시
  const display = useMemo(() => {
    const sliced = filtered.slice(-10);
    
    // 날짜별로 해당 날짜에 업로드된 영상 찾기
    return sliced.map(p => {
      const matchingVideo = videos.find(v => v.upload_date.slice(0, 10) === p.date);
      
      return {
        ...p,
        dateLabel: formatMMDD(p.date),
        title: matchingVideo?.title || "",
        rank: matchingVideo ? (videoRankMap.get(matchingVideo.title) || 0) : 0,
        percentage: totalViews > 0 ? ((p.views / totalViews) * 100).toFixed(2) : "0",
        uploadDate: p.date,
        duration: matchingVideo ? formatDuration(matchingVideo.duration) : "",
      };
    });
  }, [filtered, videos, videoRankMap, totalViews]);

  const maxY = useMemo(() => {
    const m = Math.max(0, ...display.map(p => p.views));
    return Math.ceil(m * 1.12);
  }, [display]);

  // 커스텀 툴팁 컴포넌트 (TopVideosChart와 동일한 디자인)
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-sm">
          <p className="font-semibold text-sm mb-2 break-words leading-tight">
            {data.title}
          </p>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              조회수 순위: <span className="font-medium text-foreground">{data.rank}위</span>
            </p>
            <p className="text-xs text-muted-foreground">
              조회수: <span className="font-medium text-foreground">{formatInt(data.views)}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              차지 비율: <span className="font-medium text-foreground">{data.percentage}%</span>
            </p>
            {data.duration && data.duration !== "0:00" && (
              <p className="text-xs text-muted-foreground">
                영상 길이: <span className="font-medium text-foreground">{data.duration}</span>
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              업로드: <span className="font-medium text-foreground">
                {new Date(data.uploadDate).toLocaleDateString('ko-KR')}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

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
              content={<CustomTooltip />} 
              cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
              wrapperStyle={{ outline: 'none' }}
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
