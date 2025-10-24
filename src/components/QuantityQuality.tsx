import React, { useMemo } from "react";
import { VideoRow, UploadFrequency } from "@/lib/types";
import { parseDurationToSeconds, formatNumber, isYoutubeShort } from "@/lib/utils";
import { SectionCard } from "@/components/ui/card";
import { MetricsCard } from "@/components/MetricsCard";
import { Calendar, CalendarCheck, Video, Clapperboard } from "lucide-react";

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
  uploadFrequency,
}: {
  videos: VideoRow[];
  loading: boolean;
  uploadFrequency?: UploadFrequency;
}) {
  const stats = useMemo(() => {
    // Classify videos using new YouTube Shorts rules
    const shortVideos = videos.filter((v) => isYoutubeShort(v));
    const longVideos = videos.filter((v) => !isYoutubeShort(v));

    const longCount = longVideos.length;
    const shortCount = shortVideos.length;

    // Duration stats
    const allDurations = videos.map((v) => parseDurationToSeconds(v.duration));
    const longDurations = longVideos.map((v) => parseDurationToSeconds(v.duration));
    
    const maxDur = allDurations.length ? Math.max(...allDurations) : 0;
    const minLongDur = longDurations.length ? Math.min(...longDurations) : 0;
    const avgDur = allDurations.length 
      ? Math.round(allDurations.reduce((a, b) => a + b, 0) / allDurations.length) 
      : 0;

    // View/Like stats
    const viewsArr = videos.map((v) => v.views ?? 0);
    const likesArr = videos.map((v) => v.likes ?? 0);

    const maxViews = viewsArr.length ? Math.max(...viewsArr) : 0;
    const minViews = viewsArr.length ? Math.min(...viewsArr) : 0;
    const avgViews = viewsArr.length 
      ? Math.round(viewsArr.reduce((a, b) => a + b, 0) / viewsArr.length) 
      : 0;
    const avgLikes = likesArr.length 
      ? Math.round(likesArr.reduce((a, b) => a + b, 0) / likesArr.length) 
      : 0;

    return {
      longCount,
      shortCount,
      maxDur,
      minLongDur,
      maxViews,
      minViews,
      avgViews,
      avgLikes,
      avgDur,
    };
  }, [videos]);

  if (loading) {
    return (
      <SectionCard title="Quality">
        <div className="grid gap-4">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={`q1-${i}`} className="h-24 bg-gray-900 animate-pulse rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={`q2-${i}`} className="h-24 bg-gray-900 animate-pulse rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={`q3-${i}`} className="h-24 bg-gray-900 animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Quality">
      <div className="grid gap-4">
        {/* 1행 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard 
            title="General/Shorts" 
            value={`${formatNumber(stats.longCount)}/${formatNumber(stats.shortCount)}`} 
            icon={Video} 
          />
          <MetricsCard title="Maximum Image Length" value={secsToLabel(stats.maxDur)} icon={Video} />
          <MetricsCard title="Minimum Image Length" value={secsToLabel(stats.minLongDur)} icon={Video} />
          <MetricsCard title="Avg. Video Length" value={secsToLabel(stats.avgDur)} icon={Video} />
        </div>
        {/* 2행 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard title="Maximum hits" value={formatNumber(stats.maxViews)} icon={Video} />
          <MetricsCard title="Minimum hits" value={formatNumber(stats.minViews)} icon={Video} />
          <MetricsCard title="Avg. hits" value={formatNumber(stats.avgViews)} icon={Video} />
          <MetricsCard title="Avg. Likes" value={formatNumber(stats.avgLikes)} icon={Video} />
        </div>
        {/* 3행: 업로드 빈도 통계 - 항상 표시 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            title="Upload(Week)"
            value={uploadFrequency ? `${uploadFrequency.averages.perWeek.toFixed(2)}/주` : "0.00개/주"}
            icon={Calendar}
          />
          <MetricsCard
            title="Upload(Month)"
            value={uploadFrequency ? `${uploadFrequency.averages.perMonth.toFixed(2)}/월` : "0.00개/월"}
            icon={CalendarCheck}
          />
          <MetricsCard
            title="Upload(Quarter)"
            value={uploadFrequency ? `${uploadFrequency.averages.perQuarter.toFixed(2)}/분기` : "0.00개/분기"}
            icon={Video}
          />
          <MetricsCard
            title="Upload(Year)"
            value={uploadFrequency ? `${uploadFrequency.averages.perYearAvg.toFixed(2)}/년` : "0.00개/년"}
            icon={Clapperboard}
          />
        </div>
      </div>
    </SectionCard>
  );
}
