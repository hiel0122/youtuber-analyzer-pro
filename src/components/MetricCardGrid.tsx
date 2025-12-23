import { useState } from "react";
import { motion } from "framer-motion";
import { Video, Eye, Users, ThumbsUp, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeInStagger, FadeInStaggerItem } from "@/components/FadeInStagger";
import { FadeIn } from "@/components/FadeIn";
import { formatInt } from "@/utils/format";
import { formatMetric } from "@/utils/formatMetric";
import { cn } from "@/lib/utils";
import { VideoRow } from "@/lib/types";

type ComparisonPeriod = 'daily' | 'monthly' | 'yearly';

interface MetricCardGridProps {
  videoRows: VideoRow[];
  channelStats: {
    subscriberCount: number;
    totalViews: number;
    hiddenSubscriber: boolean;
  } | null;
}

// Helper to parse duration string to seconds
const parseDuration = (duration: string | undefined): number => {
  if (!duration) return 0;
  const parts = duration.split(':').map(Number);
  return parts.length === 3 
    ? parts[0] * 3600 + parts[1] * 60 + parts[2]
    : parts[0] * 60 + parts[1];
};

// Helper to format seconds to duration string
const formatDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);
  return hours > 0 
    ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

interface TrendBadgeProps {
  value: number;
  period: ComparisonPeriod;
}

const TrendBadge = ({ value, period }: TrendBadgeProps) => {
  const periodLabel = period === 'daily' ? '전일' : period === 'monthly' ? '전월' : '전년도';
  const isPositive = value >= 0;
  
  return (
    <div 
      className={cn(
        "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded transition-colors duration-200 w-fit cursor-help",
        isPositive
          ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
          : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      )}
      title={`${periodLabel} 대비 ${Math.abs(value).toFixed(1)}% ${isPositive ? '증가' : '감소'}`}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      <span>
        {isPositive ? '+' : ''}{value.toFixed(1)}%
      </span>
    </div>
  );
};

interface SingleMetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend: number;
  period: ComparisonPeriod;
  useKoreanUnit?: boolean;
}

const SingleMetricCard = ({ icon, label, value, trend, period, useKoreanUnit = false }: SingleMetricCardProps) => (
  <FadeInStaggerItem>
    <motion.div 
      className="bg-card rounded-xl p-4 border border-border cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 [&:not(:focus-visible)]:outline-none min-h-[120px] flex flex-col"
      tabIndex={-1}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 30px -10px rgba(59, 130, 246, 0.3)"
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2 text-secondary-foreground mb-3">
        {icon}
        <span className="text-xs font-medium truncate">{label}</span>
      </div>
      <div 
        className={cn(
          "font-bold text-foreground mb-2 truncate",
          useKoreanUnit ? "text-2xl" : "text-lg"
        )} 
        title={String(value)}
      >
        {value}
      </div>
      <div className="mt-auto">
        <TrendBadge value={trend} period={period} />
      </div>
    </motion.div>
  </FadeInStaggerItem>
);

const CommentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
  </svg>
);

// Default trend values (mock data for now)
const getDefaultTrends = (period: ComparisonPeriod) => {
  // In a real implementation, these would be calculated from historical data
  const multiplier = period === 'daily' ? 0.3 : period === 'monthly' ? 1 : 2.5;
  return {
    subscriber: 20.1 * multiplier,
    videos: 12.5 * multiplier,
    views: 19.3 * multiplier,
    likes: 15.7 * multiplier,
    comments: 22.3 * multiplier,
    maxVideoLength: 5.2 * multiplier,
    maxViews: 30.5 * multiplier,
    maxLikes: 25.7 * multiplier,
    maxComments: 35.2 * multiplier,
    minVideoLength: -2.1 * multiplier,
    minViews: 8.3 * multiplier,
    minLikes: 5.8 * multiplier,
    minComments: 12.5 * multiplier,
    avgVideoLength: 3.2 * multiplier,
    avgViews: -4.3 * multiplier,
    avgLikes: 6.5 * multiplier,
    avgComments: 14.2 * multiplier,
  };
};

export function MetricCardGrid({ videoRows, channelStats }: MetricCardGridProps) {
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>('monthly');
  const trends = getDefaultTrends(comparisonPeriod);

  // Calculate metrics
  const longForm = videoRows.filter(v => parseDuration(v.duration) >= 60).length;
  const shortForm = videoRows.length - longForm;
  
  const totalViews = videoRows.reduce((sum, v) => sum + (v.views || 0), 0);
  const totalLikes = videoRows.reduce((sum, v) => sum + (v.likes || 0), 0);
  const totalComments = videoRows.reduce((sum, v) => sum + (v.comments || 0), 0);
  
  const viewsList = videoRows.map(v => v.views || 0);
  const likesList = videoRows.map(v => v.likes || 0);
  const commentsList = videoRows.map(v => v.comments || 0);
  const durationsList = videoRows.map(v => parseDuration(v.duration)).filter(d => d > 0);
  
  const maxViews = viewsList.length > 0 ? Math.max(...viewsList) : 0;
  const maxLikes = likesList.length > 0 ? Math.max(...likesList) : 0;
  const maxComments = commentsList.length > 0 ? Math.max(...commentsList) : 0;
  const maxDuration = durationsList.length > 0 ? Math.max(...durationsList) : 0;
  
  const positiveViews = viewsList.filter(v => v > 0);
  const positiveLikes = likesList.filter(v => v > 0);
  const positiveComments = commentsList.filter(v => v > 0);
  
  const minViews = positiveViews.length > 0 ? Math.min(...positiveViews) : 0;
  const minLikes = positiveLikes.length > 0 ? Math.min(...positiveLikes) : 0;
  const minComments = positiveComments.length > 0 ? Math.min(...positiveComments) : 0;
  const minDuration = durationsList.length > 0 ? Math.min(...durationsList) : 0;
  
  const avgViews = videoRows.length > 0 ? Math.round(totalViews / videoRows.length) : 0;
  const avgLikes = videoRows.length > 0 ? Math.round(totalLikes / videoRows.length) : 0;
  const avgComments = videoRows.length > 0 ? Math.round(totalComments / videoRows.length) : 0;
  const avgDuration = durationsList.length > 0 
    ? durationsList.reduce((a, b) => a + b, 0) / durationsList.length 
    : 0;

  return (
    <>
      {/* Comparison Period Selector */}
      <FadeIn delay={0.15}>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm font-medium text-muted-foreground">비교 기준:</span>
          <div className="flex gap-2">
            <Button
              variant={comparisonPeriod === 'daily' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setComparisonPeriod('daily')}
              className={cn(
                "transition-all duration-200",
                comparisonPeriod === 'daily' && "shadow-lg scale-105"
              )}
            >
              전일 대비
            </Button>
            <Button
              variant={comparisonPeriod === 'monthly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setComparisonPeriod('monthly')}
              className={cn(
                "transition-all duration-200",
                comparisonPeriod === 'monthly' && "shadow-lg scale-105"
              )}
            >
              전월 대비
            </Button>
            <Button
              variant={comparisonPeriod === 'yearly' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setComparisonPeriod('yearly')}
              className={cn(
                "transition-all duration-200",
                comparisonPeriod === 'yearly' && "shadow-lg scale-105"
              )}
            >
              전년도 대비
            </Button>
          </div>
        </div>
      </FadeIn>

      {/* Metrics Grid */}
      <FadeInStagger staggerDelay={0.05}>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-8">
          
          {/* Row 1: Total metrics (5개) */}
          <SingleMetricCard
            icon={<Users className="w-4 h-4" />}
            label="Total Subscriber"
            value={formatMetric(channelStats?.subscriberCount || 0)}
            trend={trends.subscriber}
            period={comparisonPeriod}
            useKoreanUnit={true}
          />
          <SingleMetricCard
            icon={<Video className="w-4 h-4" />}
            label="Total Contents (L/S)"
            value={`${formatInt(longForm)} / ${formatInt(shortForm)}`}
            trend={trends.videos}
            period={comparisonPeriod}
          />
          <SingleMetricCard
            icon={<Eye className="w-4 h-4" />}
            label="Total Views"
            value={(totalViews).toLocaleString('ko-KR')}
            trend={trends.views}
            period={comparisonPeriod}
          />
          <SingleMetricCard
            icon={<ThumbsUp className="w-4 h-4" />}
            label="Total Likes"
            value={(totalLikes).toLocaleString('ko-KR')}
            trend={trends.likes}
            period={comparisonPeriod}
          />
          <SingleMetricCard
            icon={<CommentIcon />}
            label="Total Comments"
            value={(totalComments).toLocaleString('ko-KR')}
            trend={trends.comments}
            period={comparisonPeriod}
          />

          {/* Row 2: Max metrics (4개) */}
          <SingleMetricCard
            icon={<Video className="w-4 h-4" />}
            label="Max. Video Length"
            value={formatDuration(maxDuration)}
            trend={trends.maxVideoLength}
            period={comparisonPeriod}
          />
          <SingleMetricCard
            icon={<Eye className="w-4 h-4" />}
            label="Max. Views"
            value={(maxViews).toLocaleString('ko-KR')}
            trend={trends.maxViews}
            period={comparisonPeriod}
          />
          <SingleMetricCard
            icon={<ThumbsUp className="w-4 h-4" />}
            label="Max. Likes"
            value={(maxLikes).toLocaleString('ko-KR')}
            trend={trends.maxLikes}
            period={comparisonPeriod}
          />
          <SingleMetricCard
            icon={<CommentIcon />}
            label="Max Comments"
            value={(maxComments).toLocaleString('ko-KR')}
            trend={trends.maxComments}
            period={comparisonPeriod}
          />

          {/* Row 3: Min metrics (4개) */}
          <SingleMetricCard
            icon={<Video className="w-4 h-4" />}
            label="Min. Video Length"
            value={formatDuration(minDuration)}
            trend={trends.minVideoLength}
            period={comparisonPeriod}
          />
          <SingleMetricCard
            icon={<Eye className="w-4 h-4" />}
            label="Min. Views"
            value={(minViews).toLocaleString('ko-KR')}
            trend={trends.minViews}
            period={comparisonPeriod}
          />
          <SingleMetricCard
            icon={<ThumbsUp className="w-4 h-4" />}
            label="Min. Likes"
            value={(minLikes).toLocaleString('ko-KR')}
            trend={trends.minLikes}
            period={comparisonPeriod}
          />
          <SingleMetricCard
            icon={<CommentIcon />}
            label="Min Comments"
            value={(minComments).toLocaleString('ko-KR')}
            trend={trends.minComments}
            period={comparisonPeriod}
          />

          {/* Row 4: Avg metrics (4개) */}
          <SingleMetricCard
            icon={<Video className="w-4 h-4" />}
            label="Avg. Video Length"
            value={formatDuration(avgDuration)}
            trend={trends.avgVideoLength}
            period={comparisonPeriod}
          />
          <SingleMetricCard
            icon={<Eye className="w-4 h-4" />}
            label="Avg. Views"
            value={(avgViews).toLocaleString('ko-KR')}
            trend={trends.avgViews}
            period={comparisonPeriod}
          />
          <SingleMetricCard
            icon={<ThumbsUp className="w-4 h-4" />}
            label="Avg. Likes"
            value={(avgLikes).toLocaleString('ko-KR')}
            trend={trends.avgLikes}
            period={comparisonPeriod}
          />
          <SingleMetricCard
            icon={<CommentIcon />}
            label="Avg. Comments"
            value={(avgComments).toLocaleString('ko-KR')}
            trend={trends.avgComments}
            period={comparisonPeriod}
          />

        </div>
      </FadeInStagger>
    </>
  );
}
