import React, { useMemo, useState } from "react";
import { VideoRow } from "@/lib/types";
import { formatMMDD, formatInt } from "@/utils/format";
import { formatNumber } from "@/lib/utils";
import { SectionCard } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList
} from "recharts";

interface ViewsTrendProps {
  videos: VideoRow[];
  loading?: boolean;
  channelTotalViews?: number;
}

type Point = { date: string; views: number };

// YouTube 썸네일 URL 생성 함수
function getYouTubeThumbnail(video: VideoRow): string {
  if (video.thumbnail_url) {
    return video.thumbnail_url;
  }
  
  if (video.video_id) {
    return `https://i.ytimg.com/vi/${video.video_id}/mqdefault.jpg`;
  }
  
  if (video.url) {
    const videoIdMatch = video.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    if (videoIdMatch && videoIdMatch[1]) {
      return `https://i.ytimg.com/vi/${videoIdMatch[1]}/mqdefault.jpg`;
    }
  }
  
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"%3E%3Crect fill="%23374151" width="320" height="180"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E썸네일 없음%3C/text%3E%3C/svg%3E';
}

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
        thumbnail: matchingVideo ? getYouTubeThumbnail(matchingVideo) : "",
        videoUrl: matchingVideo?.url || "",
        duration: matchingVideo ? formatDuration(matchingVideo.duration) : "",
      };
    });
  }, [filtered, videos, videoRankMap, totalViews]);

  const maxY = useMemo(() => {
    const m = Math.max(0, ...display.map(p => p.views));
    return Math.ceil(m * 1.12);
  }, [display]);

  // 커스텀 툴팁 컴포넌트
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg overflow-hidden shadow-lg max-w-md">
          {/* 썸네일 - 클릭 가능 */}
          <a 
            href={data.videoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block relative w-full h-48 bg-muted hover:opacity-95 transition-all group"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={data.thumbnail}
              alt={data.title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="320" height="180" viewBox="0 0 320 180"%3E%3Crect fill="%23374151" width="320" height="180"/%3E%3Ctext fill="%239CA3AF" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3E썸네일 없음%3C/text%3E%3C/svg%3E';
              }}
            />
            
            {/* 호버 시 "영상 보기" 오버레이 */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-white text-sm font-semibold flex items-center gap-2 bg-black/50 px-4 py-2 rounded-lg">
                <ExternalLink className="w-4 h-4" />
                영상 보기
              </div>
            </div>
            
            {/* 순위 뱃지 */}
            {data.rank > 0 && (
              <div className="absolute top-2 left-2 bg-black/80 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                {data.rank}위
              </div>
            )}
            
            {/* 영상 길이 */}
            {data.duration && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                {data.duration}
              </div>
            )}
          </a>
          
          {/* 정보 */}
          <div className="p-3 space-y-2">
            <p className="font-semibold text-sm leading-tight line-clamp-2 break-words">
              {data.title}
            </p>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">
                조회수: <span className="font-medium text-foreground">{formatInt(data.views)}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                차지 비율: <span className="font-medium text-foreground">{data.percentage}%</span>
              </p>
              <p className="text-xs text-muted-foreground">
                업로드: <span className="font-medium text-foreground">
                  {new Date(data.uploadDate).toLocaleDateString('ko-KR')}
                </span>
              </p>
            </div>
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
