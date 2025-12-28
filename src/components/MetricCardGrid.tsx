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
  value: number | null;
  period: ComparisonPeriod;
  hasData: boolean;
}

const TrendBadge = ({ value, period, hasData }: TrendBadgeProps) => {
  const periodLabel = period === 'daily' ? '전일' : period === 'monthly' ? '전월' : '전년도';
  
  // 데이터가 없으면 하이픈 표시
  if (!hasData || value === null) {
    return (
      <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground w-fit">
        <span>-</span>
      </div>
    );
  }
  
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
  trend: number | null;
  period: ComparisonPeriod;
  hasData: boolean;
  insufficientData?: boolean;
  useKoreanUnit?: boolean;
}

const SingleMetricCard = ({ 
  icon, 
  label, 
  value, 
  trend, 
  period, 
  hasData,
  insufficientData = false,
  useKoreanUnit = false 
}: SingleMetricCardProps) => (
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
        {hasData ? value : '-'}
      </div>
      <div className="mt-auto">
        {insufficientData ? (
          <div className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded bg-yellow-500/10 text-yellow-600 w-fit">
            <span>데이터 부족</span>
          </div>
        ) : (
          <TrendBadge value={trend} period={period} hasData={hasData} />
        )}
      </div>
    </motion.div>
  </FadeInStaggerItem>
);

const CommentIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
  </svg>
);

// 과거 데이터와 비교하여 증감률 계산
const calculateTrend = (
  current: number,
  previous: number | null
): number | null => {
  if (previous === null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
};

// 채널 운영 기간 확인
const checkDataAvailability = (
  videoRows: VideoRow[],
  period: ComparisonPeriod
): { hasData: boolean; insufficientData: boolean } => {
  if (videoRows.length === 0) {
    return { hasData: false, insufficientData: false };
  }
  
  const now = new Date();
  const oldestVideo = videoRows.reduce((oldest, video) => {
    const videoDate = new Date(video.upload_date || now);
    return videoDate < oldest ? videoDate : oldest;
  }, now);
  
  const daysSinceOldest = Math.floor((now.getTime() - oldestVideo.getTime()) / (1000 * 60 * 60 * 24));
  
  // 비교 기준에 따른 필요 기간
  const requiredDays = {
    daily: 2,      // 최소 2일
    monthly: 31,   // 최소 1개월
    yearly: 366    // 최소 1년
  };
  
  const hasData = videoRows.length > 0;
  const insufficientData = daysSinceOldest < requiredDays[period];
  
  return { hasData, insufficientData };
};

// 기간별 과거 데이터 필터링
const getComparisonData = (
  videoRows: VideoRow[],
  period: ComparisonPeriod
) => {
  const now = new Date();
  let compareDate: Date;
  
  switch (period) {
    case 'daily':
      compareDate = new Date(now);
      compareDate.setDate(compareDate.getDate() - 1);
      break;
    case 'monthly':
      compareDate = new Date(now);
      compareDate.setMonth(compareDate.getMonth() - 1);
      break;
    case 'yearly':
      compareDate = new Date(now);
      compareDate.setFullYear(compareDate.getFullYear() - 1);
      break;
  }
  
  // 비교 기간의 데이터 필터링
  const currentPeriodVideos = videoRows.filter(v => {
    const uploadDate = new Date(v.upload_date || 0);
    return uploadDate >= compareDate && uploadDate <= now;
  });
  
  // 이전 기간의 데이터 필터링
  let previousCompareDate: Date;
  switch (period) {
    case 'daily':
      previousCompareDate = new Date(compareDate);
      previousCompareDate.setDate(previousCompareDate.getDate() - 1);
      break;
    case 'monthly':
      previousCompareDate = new Date(compareDate);
      previousCompareDate.setMonth(previousCompareDate.getMonth() - 1);
      break;
    case 'yearly':
      previousCompareDate = new Date(compareDate);
      previousCompareDate.setFullYear(previousCompareDate.getFullYear() - 1);
      break;
  }
  
  const previousPeriodVideos = videoRows.filter(v => {
    const uploadDate = new Date(v.upload_date || 0);
    return uploadDate >= previousCompareDate && uploadDate < compareDate;
  });
  
  return { currentPeriodVideos, previousPeriodVideos };
};

// 실제 증감률 계산
const calculateTrends = (
  videoRows: VideoRow[],
  period: ComparisonPeriod
) => {
  const { currentPeriodVideos, previousPeriodVideos } = getComparisonData(videoRows, period);
  
  if (previousPeriodVideos.length === 0) {
    // 이전 기간 데이터 없음 - null 반환
    return {
      subscriber: null,
      videos: null,
      views: null,
      likes: null,
      comments: null,
      maxVideoLength: null,
      maxViews: null,
      maxLikes: null,
      maxComments: null,
      minVideoLength: null,
      minViews: null,
      minLikes: null,
      minComments: null,
      avgVideoLength: null,
      avgViews: null,
      avgLikes: null,
      avgComments: null,
    };
  }
  
  // 현재 기간 통계
  const currentStats = {
    videoCount: currentPeriodVideos.length,
    totalViews: currentPeriodVideos.reduce((sum, v) => sum + (v.views || 0), 0),
    totalLikes: currentPeriodVideos.reduce((sum, v) => sum + (v.likes || 0), 0),
    totalComments: currentPeriodVideos.reduce((sum, v) => sum + (v.comments || 0), 0),
    avgViews: currentPeriodVideos.length > 0 
      ? currentPeriodVideos.reduce((sum, v) => sum + (v.views || 0), 0) / currentPeriodVideos.length 
      : 0,
    avgLikes: currentPeriodVideos.length > 0
      ? currentPeriodVideos.reduce((sum, v) => sum + (v.likes || 0), 0) / currentPeriodVideos.length
      : 0,
    avgComments: currentPeriodVideos.length > 0
      ? currentPeriodVideos.reduce((sum, v) => sum + (v.comments || 0), 0) / currentPeriodVideos.length
      : 0,
  };
  
  // 이전 기간 통계
  const previousStats = {
    videoCount: previousPeriodVideos.length,
    totalViews: previousPeriodVideos.reduce((sum, v) => sum + (v.views || 0), 0),
    totalLikes: previousPeriodVideos.reduce((sum, v) => sum + (v.likes || 0), 0),
    totalComments: previousPeriodVideos.reduce((sum, v) => sum + (v.comments || 0), 0),
    avgViews: previousPeriodVideos.length > 0
      ? previousPeriodVideos.reduce((sum, v) => sum + (v.views || 0), 0) / previousPeriodVideos.length
      : 0,
    avgLikes: previousPeriodVideos.length > 0
      ? previousPeriodVideos.reduce((sum, v) => sum + (v.likes || 0), 0) / previousPeriodVideos.length
      : 0,
    avgComments: previousPeriodVideos.length > 0
      ? previousPeriodVideos.reduce((sum, v) => sum + (v.comments || 0), 0) / previousPeriodVideos.length
      : 0,
  };
  
  // 증감률 계산
  return {
    subscriber: null, // 구독자는 스냅샷 데이터가 없으므로 null
    videos: calculateTrend(currentStats.videoCount, previousStats.videoCount),
    views: calculateTrend(currentStats.totalViews, previousStats.totalViews),
    likes: calculateTrend(currentStats.totalLikes, previousStats.totalLikes),
    comments: calculateTrend(currentStats.totalComments, previousStats.totalComments),
    maxVideoLength: null, // 단일 영상 비교는 의미 없으므로 null
    maxViews: null,
    maxLikes: null,
    maxComments: null,
    minVideoLength: null,
    minViews: null,
    minLikes: null,
    minComments: null,
    avgVideoLength: null,
    avgViews: calculateTrend(currentStats.avgViews, previousStats.avgViews),
    avgLikes: calculateTrend(currentStats.avgLikes, previousStats.avgLikes),
    avgComments: calculateTrend(currentStats.avgComments, previousStats.avgComments),
  };
};

export function MetricCardGrid({ videoRows, channelStats }: MetricCardGridProps) {
  const [comparisonPeriod, setComparisonPeriod] = useState<ComparisonPeriod>('daily');
  
  // 데이터 가용성 체크
  const { hasData, insufficientData } = checkDataAvailability(videoRows, comparisonPeriod);
  
  // 실제 증감률 계산
  const trends = calculateTrends(videoRows, comparisonPeriod);

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
            hasData={hasData}
            insufficientData={insufficientData}
            useKoreanUnit={true}
          />
          <SingleMetricCard
            icon={<Video className="w-4 h-4" />}
            label="Total Contents (L/S)"
            value={`${formatInt(longForm)} / ${formatInt(shortForm)}`}
            trend={trends.videos}
            period={comparisonPeriod}
            hasData={hasData}
            insufficientData={insufficientData}
          />
          <SingleMetricCard
            icon={<Eye className="w-4 h-4" />}
            label="Total Views"
            value={(totalViews).toLocaleString('ko-KR')}
            trend={trends.views}
            period={comparisonPeriod}
            hasData={hasData}
            insufficientData={insufficientData}
          />
          <SingleMetricCard
            icon={<ThumbsUp className="w-4 h-4" />}
            label="Total Likes"
            value={(totalLikes).toLocaleString('ko-KR')}
            trend={trends.likes}
            period={comparisonPeriod}
            hasData={hasData}
            insufficientData={insufficientData}
          />
          <SingleMetricCard
            icon={<CommentIcon />}
            label="Total Comments"
            value={(totalComments).toLocaleString('ko-KR')}
            trend={trends.comments}
            period={comparisonPeriod}
            hasData={hasData}
            insufficientData={insufficientData}
          />

          {/* Row 2: Max metrics (4개) */}
          <SingleMetricCard
            icon={<Video className="w-4 h-4" />}
            label="Max. Video Length"
            value={formatDuration(maxDuration)}
            trend={trends.maxVideoLength}
            period={comparisonPeriod}
            hasData={hasData}
            insufficientData={insufficientData}
          />
          <SingleMetricCard
            icon={<Eye className="w-4 h-4" />}
            label="Max. Views"
            value={(maxViews).toLocaleString('ko-KR')}
            trend={trends.maxViews}
            period={comparisonPeriod}
            hasData={hasData}
            insufficientData={insufficientData}
          />
          <SingleMetricCard
            icon={<ThumbsUp className="w-4 h-4" />}
            label="Max. Likes"
            value={(maxLikes).toLocaleString('ko-KR')}
            trend={trends.maxLikes}
            period={comparisonPeriod}
            hasData={hasData}
            insufficientData={insufficientData}
          />
          <SingleMetricCard
            icon={<CommentIcon />}
            label="Max Comments"
            value={(maxComments).toLocaleString('ko-KR')}
            trend={trends.maxComments}
            period={comparisonPeriod}
            hasData={hasData}
            insufficientData={insufficientData}
          />

          {/* Row 3: Min metrics (4개) */}
          <SingleMetricCard
            icon={<Video className="w-4 h-4" />}
            label="Min. Video Length"
            value={formatDuration(minDuration)}
            trend={trends.minVideoLength}
            period={comparisonPeriod}
            hasData={hasData}
            insufficientData={insufficientData}
          />
          <SingleMetricCard
            icon={<Eye className="w-4 h-4" />}
            label="Min. Views"
            value={(minViews).toLocaleString('ko-KR')}
            trend={trends.minViews}
            period={comparisonPeriod}
            hasData={hasData}
            insufficientData={insufficientData}
          />
          <SingleMetricCard
            icon={<ThumbsUp className="w-4 h-4" />}
            label="Min. Likes"
            value={(minLikes).toLocaleString('ko-KR')}
            trend={trends.minLikes}
            period={comparisonPeriod}
            hasData={hasData}
            insufficientData={insufficientData}
          />
          <SingleMetricCard
            icon={<CommentIcon />}
            label="Min Comments"
            value={(minComments).toLocaleString('ko-KR')}
            trend={trends.minComments}
            period={comparisonPeriod}
            hasData={hasData}
            insufficientData={insufficientData}
          />

          {/* Row 4: Avg metrics (4개) */}
          <SingleMetricCard
            icon={<Video className="w-4 h-4" />}
            label="Avg. Video Length"
            value={formatDuration(avgDuration)}
            trend={trends.avgVideoLength}
            period={comparisonPeriod}
            hasData={hasData}
            insufficientData={insufficientData}
          />
          <SingleMetricCard
            icon={<Eye className="w-4 h-4" />}
            label="Avg. Views"
            value={(avgViews).toLocaleString('ko-KR')}
            trend={trends.avgViews}
            period={comparisonPeriod}
            hasData={hasData}
            insufficientData={insufficientData}
          />
          <SingleMetricCard
            icon={<ThumbsUp className="w-4 h-4" />}
            label="Avg. Likes"
            value={(avgLikes).toLocaleString('ko-KR')}
            trend={trends.avgLikes}
            period={comparisonPeriod}
            hasData={hasData}
            insufficientData={insufficientData}
          />
          <SingleMetricCard
            icon={<CommentIcon />}
            label="Avg. Comments"
            value={(avgComments).toLocaleString('ko-KR')}
            trend={trends.avgComments}
            period={comparisonPeriod}
            hasData={hasData}
            insufficientData={insufficientData}
          />

        </div>
      </FadeInStagger>
    </>
  );
}
