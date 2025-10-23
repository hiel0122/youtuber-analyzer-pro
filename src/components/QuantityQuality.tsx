import React, { useMemo } from "react";
import { VideoRow, UploadFrequency } from "@/lib/types";
import { parseDurationToSeconds, formatNumber } from "@/lib/utils";
import { SectionCard } from "@/components/ui/card";
import { Calendar, CalendarCheck, Video, Clapperboard } from "lucide-react";

function StatCard({ title, value, icon: Icon }: { title: string; value: string | number; icon?: React.ElementType }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-muted/50 p-4 border border-border">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{title}</div>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="text-2xl font-semibold text-foreground">{value}</div>
    </div>
  );
}

function secsToLabel(secs: number) {
  if (secs <= 0) return "0s";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function QuantityQuality({ 
  videos, 
  loading, 
  uploadFrequency 
}: { 
  videos: VideoRow[]; 
  loading: boolean;
  uploadFrequency?: UploadFrequency;
}) {
  const stats = useMemo(() => {
    const durations = videos.map(v => parseDurationToSeconds(v.duration));
    const viewsArr = videos.map(v => v.views ?? 0);
    const likesArr = videos.map(v => v.likes ?? 0);

    const longArr = durations.filter(d => d > 60);
    const shortArr = durations.filter(d => d <= 60);

    const longCount = longArr.length;
    const shortCount = shortArr.length;
    const maxDur = durations.length ? Math.max(...durations) : 0;
    const minLongDur = longArr.length ? Math.min(...longArr) : 0;

    const maxViews = viewsArr.length ? Math.max(...viewsArr) : 0;
    const minViews = viewsArr.length ? Math.min(...viewsArr) : 0;
    const avgViews = viewsArr.length ? Math.round(viewsArr.reduce((a,b)=>a+b,0) / viewsArr.length) : 0;
    const avgLikes = likesArr.length ? Math.round(likesArr.reduce((a,b)=>a+b,0) / likesArr.length) : 0;

    return {
      longCount, shortCount, maxDur, minLongDur,
      maxViews, minViews, avgViews, avgLikes,
    };
  }, [videos]);

  if (loading) {
    return (
      <div className="grid gap-4">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_,i) => <div key={`q1-${i}`} className="h-24 bg-gray-900 animate-pulse rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_,i) => <div key={`q2-${i}`} className="h-24 bg-gray-900 animate-pulse rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_,i) => <div key={`q3-${i}`} className="h-24 bg-gray-900 animate-pulse rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <SectionCard title="Quality">
      <div className="grid gap-3">
        {/* 1행 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="롱폼 개수 (>60s)" value={formatNumber(stats.longCount)} />
          <StatCard title="숏폼 개수 (≤60s)" value={formatNumber(stats.shortCount)} />
          <StatCard title="최대 영상 길이" value={secsToLabel(stats.maxDur)} />
          <StatCard title="최소 영상 길이(숏폼 제외)" value={secsToLabel(stats.minLongDur)} />
        </div>
        {/* 2행 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard title="최고 조회수" value={formatNumber(stats.maxViews)} />
          <StatCard title="최저 조회수" value={formatNumber(stats.minViews)} />
          <StatCard title="평균 조회수" value={formatNumber(stats.avgViews)} />
          <StatCard title="평균 좋아요" value={formatNumber(stats.avgLikes)} />
        </div>
        {/* 3행: 업로드 빈도 통계 - 항상 표시 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard 
            title="평균 영상 업로드 (Week)" 
            value={uploadFrequency 
              ? `${uploadFrequency.averages.perWeek.toFixed(2)}/주`
              : '0.00/주'
            }
            icon={Calendar}
          />
          <StatCard 
            title="평균 영상 업로드 (Month)" 
            value={uploadFrequency
              ? `${uploadFrequency.averages.perMonth.toFixed(2)}/월`
              : '0.00/월'
            }
            icon={CalendarCheck}
          />
          <StatCard 
            title="평균 영상 업로드 (General)" 
            value={uploadFrequency
              ? `${uploadFrequency.averages.perMonthGeneral.toFixed(2)}/월`
              : '0.00/월'
            }
            icon={Video}
          />
          <StatCard 
            title="평균 영상 업로드 (Shorts)" 
            value={uploadFrequency
              ? `${uploadFrequency.averages.perMonthShorts.toFixed(2)}/월`
              : '0.00/월'
            }
            icon={Clapperboard}
          />
        </div>
      </div>
    </SectionCard>
  );
}
