import { SectionCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoRow, UploadFrequency } from "@/lib/types";
import { User, CalendarRange, Tag, Sparkles } from "lucide-react";
import { formatInt } from "@/utils/format";
import { parseDurationToSeconds } from "@/lib/utils";

interface ChannelSummaryProps {
  channelName?: string;
  videos: VideoRow[];
  uploadFrequency?: UploadFrequency;
  loading?: boolean;
}

export function ChannelSummary({ channelName, videos, uploadFrequency, loading }: ChannelSummaryProps) {
  if (loading || !videos.length) {
    return null;
  }

  // 첫 업로드일 계산
  const firstUploadDate = videos.length > 0 
    ? videos.reduce((earliest, v) => {
        const date = new Date(v.upload_date);
        return date < earliest ? date : earliest;
      }, new Date(videos[0].upload_date))
    : null;

  // 운영기간 계산
  const calculatePeriod = (startDate: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = (diffDays % 365) % 30;
    
    return { years, months, days, diffDays };
  };

  const period = firstUploadDate ? calculatePeriod(firstUploadDate) : null;
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
  // 주제 최빈값 계산
  const topicCounts = videos.reduce((acc, v) => {
    if (v.topic) {
      acc[v.topic] = (acc[v.topic] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const primaryTopic = Object.keys(topicCounts).length > 0
    ? Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  // 특징 계산
  const traits: string[] = [];
  
  // 평균 영상 길이
  const durations = videos.map(v => parseDurationToSeconds(v.duration)).filter(d => d > 0);
  const avgDurationMinutes = durations.length > 0 
    ? durations.reduce((a, b) => a + b, 0) / durations.length / 60 
    : 0;
  
  if (avgDurationMinutes >= 8) {
    traits.push("롱폼 중심");
  } else if (avgDurationMinutes > 0 && avgDurationMinutes < 8) {
    traits.push("숏폼/쇼츠 중심");
  }

  // 업로드 빈도
  const uploadsPerWeek = uploadFrequency?.averages?.perWeek || 0;
  if (uploadsPerWeek >= 2) {
    traits.push("활발한 업로드");
  } else if (uploadsPerWeek >= 1) {
    traits.push("주 1회");
  } else if (uploadsPerWeek > 0) {
    traits.push("비정기");
  }

  // 좋아요 반응
  const videosWithStats = videos.filter(v => v.views && v.views > 0 && v.likes);
  if (videosWithStats.length > 0) {
    const avgLikeRatio = videosWithStats.reduce((sum, v) => {
      return sum + ((v.likes || 0) / (v.views || 1)) * 100;
    }, 0) / videosWithStats.length;
    
    if (avgLikeRatio >= 3) {
      traits.push("좋아요 반응 높음");
    }
  }

  return (
    <section className="mb-8">
      <SectionCard 
        title="채널 요약" 
        className="border-primary/20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 좌측: 채널 기본 정보 */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-xl shrink-0">
              {channelName ? channelName.charAt(0).toUpperCase() : "?"}
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-bold text-foreground mb-1 truncate">
                {channelName || "YouTube Channel"}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                <span>관리자: —</span>
              </div>
            </div>
          </div>

          {/* 우측: 통계 요약 */}
          <div className="space-y-3">
            {/* 운영기간 */}
            {period && firstUploadDate && (
              <div className="flex items-start gap-2">
                <CalendarRange className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">
                    운영기간: {period.years}년 {period.months}개월 {period.days}일
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(firstUploadDate)} ~ {formatDate(new Date())}
                  </div>
                </div>
              </div>
            )}

            {/* 주제 */}
            {primaryTopic && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary shrink-0" />
                <div className="text-sm">
                  <span className="font-medium text-foreground">주제: </span>
                  <span className="text-muted-foreground">{primaryTopic}</span>
                </div>
              </div>
            )}

            {/* 특징 */}
            {traits.length > 0 && (
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-foreground">특징:</span>
                  {traits.map((trait, idx) => (
                    <Badge 
                      key={idx} 
                      variant="secondary"
                      className="text-xs bg-primary/10 text-primary border-primary/20"
                    >
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </SectionCard>
    </section>
  );
}
