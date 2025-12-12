import React, { useMemo } from "react";
import { VideoRow, UploadFrequency, SubscriptionRates, CommentStats } from "@/lib/types";
import { parseDurationToSeconds, formatNumber, isYoutubeShort } from "@/lib/utils";
import { SectionCard } from "@/components/ui/card";
import { MetricsCard } from "@/components/MetricsCard";
import { RowHeader } from "@/components/RowHeader";
import { CalendarCheck, Video, ThumbsUp, UserPlus, MessageSquare } from "lucide-react";
import { formatInt, formatIntOrDash } from "@/utils/format";
import { formatMetric } from "@/utils/formatMetric";

function secsToLabel(secs: number) {
  if (secs <= 0) return "0s";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatSigned(n: number) {
  const s = Math.round(n);
  if (s === 0) return "—";
  if (s > 0) return `+${formatInt(s)}`;
  if (s < 0) return `-${formatInt(Math.abs(s))}`;
  return "—";
}

export default function QuantityQuality({
  videos,
  loading,
  uploadFrequency,
  subscriptionRates,
  commentStats,
  isLoaded = true,
  hasData = true,
}: {
  videos: VideoRow[];
  loading: boolean;
  uploadFrequency?: UploadFrequency;
  subscriptionRates?: SubscriptionRates;
  commentStats?: CommentStats;
  isLoaded?: boolean;
  hasData?: boolean;
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
              <div key={`q1-${i}`} className="h-24 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={`q2-${i}`} className="h-24 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={`q3-${i}`} className="h-24 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </SectionCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* 1행: [Video] */}
        <div>
          <RowHeader title="[Video]" Icon={Video} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricsCard 
              title="General/Shorts" 
              value={`${formatMetric(stats.longCount, { isLoaded, hasData })}/${formatMetric(stats.shortCount, { isLoaded, hasData })}`} 
            />
            <MetricsCard title="Maximum Image Length" value={secsToLabel(stats.maxDur)} />
            <MetricsCard title="Minimum Image Length" value={secsToLabel(stats.minLongDur)} />
            <MetricsCard title="Avg. Video Length" value={secsToLabel(stats.avgDur)} />
          </div>
        </div>

        {/* 2행: [Hits & Likes] */}
        <div>
          <RowHeader title="[Hits & Likes]" Icon={ThumbsUp} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricsCard title="Maximum hits" value={formatMetric(stats.maxViews, { isLoaded, hasData })} />
            <MetricsCard title="Minimum hits" value={formatMetric(stats.minViews, { isLoaded, hasData })} />
            <MetricsCard title="Avg. hits" value={formatMetric(stats.avgViews, { isLoaded, hasData })} />
            <MetricsCard title="Avg. Likes" value={formatMetric(stats.avgLikes, { isLoaded, hasData })} />
          </div>
        </div>

        {/* 3행: [Upload] */}
        <div>
          <RowHeader title="[Upload]" Icon={CalendarCheck} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricsCard
              title="Upload(Week)"
              value={uploadFrequency ? `${formatMetric(Math.round(uploadFrequency.averages.perWeek), { isLoaded, hasData })}/주` : "—"}
            />
            <MetricsCard
              title="Upload(Month)"
              value={uploadFrequency ? `${formatMetric(Math.round(uploadFrequency.averages.perMonth), { isLoaded, hasData })}/월` : "—"}
            />
            <MetricsCard
              title="Upload(Quarter)"
              value={uploadFrequency ? `${formatMetric(Math.round(uploadFrequency.averages.perQuarter), { isLoaded, hasData })}/분기` : "—"}
            />
            <MetricsCard
              title="Upload(Year)"
              value={uploadFrequency ? `${formatMetric(Math.round(uploadFrequency.averages.perYearAvg), { isLoaded, hasData })}/년` : "—"}
            />
          </div>
        </div>

        {/* 4행: [Subscription] - Only show if data available */}
        {subscriptionRates && (
          <div>
            <RowHeader title="[Subscription]" Icon={UserPlus} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricsCard 
                title="Subscription ± Rate (Days)" 
                value={formatMetric(subscriptionRates.day, { zeroAsDash: true, isLoaded, hasData })} 
              />
              <MetricsCard 
                title="Subscription ± Rate (Week)" 
                value={formatMetric(subscriptionRates.week, { zeroAsDash: true, isLoaded, hasData })} 
              />
              <MetricsCard 
                title="Subscription ± Rate (Month)" 
                value={formatMetric(subscriptionRates.month, { zeroAsDash: true, isLoaded, hasData })} 
              />
              <MetricsCard 
                title="Subscription ± Rate (Year)" 
                value={formatMetric(subscriptionRates.year, { zeroAsDash: true, isLoaded, hasData })} 
              />
            </div>
          </div>
        )}

        {/* 5행: [Comments] */}
        <div>
          <RowHeader title="[Comments]" Icon={MessageSquare} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricsCard 
              title="All Comments" 
              value={commentStats ? formatMetric(commentStats.total, { isLoaded, hasData }) : "—"} 
            />
            <MetricsCard 
              title="Maximum Comments (per video)" 
              value={commentStats ? formatMetric(commentStats.maxPerVideo, { isLoaded, hasData }) : "—"} 
            />
            <MetricsCard 
              title="Minimum Comments (per video)" 
              value={commentStats ? formatMetric(commentStats.minPerVideo, { isLoaded, hasData }) : "—"} 
            />
            <MetricsCard 
              title="Avg. comment (per video)" 
              value={commentStats ? formatMetric(Math.round(commentStats.avgPerVideo), { isLoaded, hasData }) : "—"} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
