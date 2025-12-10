import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { analyzeChannelTags, ChannelTags } from "@/lib/channelAnalyzer";

type Video = {
  upload_date?: string | null;
  topic?: string | null;
  duration?: string | null; // "HH:MM:SS" | "MM:SS"
  views?: number | null;
  likes?: number | null;
  title?: string | null;
};

type UploadFrequency = {
  averages?: {
    perWeek?: number;
  };
};

// 운영기간 계산(년/월/일)
const calcPeriod = (start: Date, end = new Date()) => {
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    const prevMonthDays = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += prevMonthDays;
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years -= 1;
  }
  return { years, months, days, start, end };
};

// 태그 색상 타입별 정의
const tagStyles = {
  contentType: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  keyword: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  identity: "bg-amber-500/15 text-amber-400 border-amber-500/30",
} as const;

type Props = {
  channelId?: string;
  channelName?: string;
  videos: Video[];
  uploadFrequency?: UploadFrequency;
};

export default function ChannelSummary({
  channelId,
  channelName,
  videos,
  uploadFrequency,
}: Props) {
  const hasVideos = Array.isArray(videos) && videos.length > 0;
  
  // 스마트 태그 분석
  const [channelTags, setChannelTags] = React.useState<ChannelTags>({
    contentType: '',
    mainKeywords: [],
    identity: [],
  });

  // channel_meta 연동 (manager_name)
  const [manager, setManager] = React.useState("");
  const [loadingMeta, setLoadingMeta] = React.useState(false);

  // 영상 데이터가 변경되면 태그 재분석
  React.useEffect(() => {
    if (hasVideos) {
      const tags = analyzeChannelTags(videos);
      setChannelTags(tags);
    }
  }, [videos, hasVideos]);

  // channel_meta 로드
  React.useEffect(() => {
    if (!channelId) return;
    (async () => {
      setLoadingMeta(true);
      const { data, error } = await supabase
        .from("channel_meta" as any)
        .select("manager_name")
        .eq("channel_id", channelId)
        .maybeSingle();
      if (!error && data) {
        const metaData = data as any;
        setManager(metaData.manager_name ?? "");
      } else {
        setManager("");
      }
      setLoadingMeta(false);
    })();
  }, [channelId]);

  if (!hasVideos) {
    return (
      <div className="text-sm text-muted-foreground">
        아직 불러온 동영상 데이터가 없습니다. 채널을 분석하거나 잠시 후 다시 시도해 주세요.
      </div>
    );
  }

  // 첫 업로드 날짜 → 운영기간
  const firstUpload = new Date(
    videos.reduce((min, v) => {
      const t = new Date(v.upload_date ?? "").getTime();
      return Math.min(min, isNaN(t) ? Infinity : t);
    }, Infinity)
  );
  const hasStart = isFinite(firstUpload.getTime());
  const period = hasStart ? calcPeriod(firstUpload) : null;

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  // 태그가 하나라도 있는지 확인
  const hasTags = channelTags.contentType || 
                  channelTags.mainKeywords.length > 0 || 
                  channelTags.identity.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        {/* 아바타 */}
        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-lg font-semibold shrink-0">
          {(channelName?.trim()?.[0] || "?").toUpperCase()}
        </div>

        {/* 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* 좌: 기본 정보 */}
          <div>
            <div className="text-sm text-muted-foreground mb-1">채널명</div>
            <div className="text-lg md:text-xl font-semibold text-foreground">{channelName || "—"}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              관리자:&nbsp;
              <span className="text-foreground font-medium">
                {loadingMeta ? "로딩 중…" : (manager || channelName || "—")}
              </span>
            </div>
          </div>

          {/* 중: 운영기간 */}
          <div>
            <div className="text-sm text-muted-foreground mb-1">운영기간</div>
            <div className="text-lg md:text-xl font-semibold text-foreground">
              {period ? `${period.years}년 ${period.months}개월 ${period.days}일` : "—"}
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {hasStart ? `${fmt(firstUpload)} ~ ${fmt(new Date())}` : "업로드 이력 없음"}
            </div>
          </div>

          {/* 우: 스마트 태그 */}
          <div>
            <div className="text-sm text-muted-foreground mb-1">주제</div>
            
            {hasTags ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {/* 콘텐츠 타입 (cyan) */}
                {channelTags.contentType && (
                  <span
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
                      tagStyles.contentType
                    )}
                  >
                    {channelTags.contentType}
                  </span>
                )}

                {/* 주요 키워드 (emerald/green) */}
                {channelTags.mainKeywords.map((keyword, i) => (
                  <span
                    key={`keyword-${i}`}
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
                      tagStyles.keyword
                    )}
                  >
                    {keyword}
                  </span>
                ))}

                {/* 채널 정체성 (amber) */}
                {channelTags.identity.map((tag, i) => (
                  <span
                    key={`identity-${i}`}
                    className={cn(
                      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
                      tagStyles.identity
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-sm text-muted-foreground">분석 중...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
