import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { pickTagColor, textOn } from "@/lib/ui/tagPalette";
import { cn } from "@/lib/utils";

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

// 간단한 duration 파서
const parseDurationToSeconds = (d?: string | null) => {
  if (!d) return 0;
  const parts = d.split(":").map(Number);
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return h * 3600 + m * 60 + s;
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return m * 60 + s;
  }
  return Number(parts[0]) || 0;
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

// 토픽 추출용(아주 가벼운 불용어/토큰화)
const STOP = new Set([
  "은","는","이","가","을","를","에","의","와","과","도","로","으로","에서","하다",
  "영상","유튜브","조회수","최신","공개","등","및","것","수","개","소개","리뷰","분석",
  "the","a","is","and","or","to","of","in","on","for","with"
]);

function extractTopTopicsFromTitles(videos: { title?: string | null }[], topN = 3) {
  const counts = new Map<string, number>();
  for (const v of videos) {
    const t = (v.title ?? "").toLowerCase();
    const tokens = t.split(/[^0-9a-zA-Z가-힣]+/).filter(Boolean);
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (tok.length < 2) continue;
      if (STOP.has(tok)) continue;
      // unigram
      counts.set(tok, (counts.get(tok) || 0) + 1);
      // bigram(가중치 0.5)
      if (i < tokens.length - 1) {
        const bi = tok + " " + tokens[i + 1];
        counts.set(bi, (counts.get(bi) || 0) + 0.5);
      }
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([k]) => k);
}

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
  if (!hasVideos) {
    return (
      <div className="text-sm text-muted-foreground">
        아직 불러온 동영상 데이터가 없습니다. 채널을 분석하거나 잠시 후 다시 시도해 주세요.
      </div>
    );
  }

  // ① 첫 업로드 날짜 → 운영기간
  const firstUpload = new Date(
    videos.reduce((min, v) => {
      const t = new Date(v.upload_date ?? "").getTime();
      return Math.min(min, isNaN(t) ? Infinity : t);
    }, Infinity)
  );
  const hasStart = isFinite(firstUpload.getTime());
  const period = hasStart ? calcPeriod(firstUpload) : null;

  // ② 자동 토픽 후보
  const topicCandidates = extractTopTopicsFromTitles(videos, 5);

  // ③ 평균 길이/업로드 빈도/좋아요 반응 기반 특징(간단 태그)
  const durations = videos.map(v => parseDurationToSeconds(v.duration)).filter(n => n > 0);
  const avgMin = durations.length ? durations.reduce((a,b)=>a+b,0)/durations.length/60 : 0;
  const traits: string[] = [];
  if (avgMin >= 8) traits.push("롱폼 중심");
  else if (avgMin > 0) traits.push("숏폼/쇼츠 중심");

  const perWeek = Number(uploadFrequency?.averages?.perWeek || 0);
  if (perWeek >= 2) traits.push("활발한 업로드");
  else if (perWeek >= 1) traits.push("주 1회");
  else if (perWeek > 0) traits.push("비정기");

  const withStats = videos.filter(v => (v.views || 0) > 0 && (v.likes || 0) >= 0);
  if (withStats.length) {
    const likeRatio = withStats.reduce((s,v)=> s + (((v.likes||0)/(v.views||1))*100), 0) / withStats.length;
    if (likeRatio >= 3) traits.push("좋아요 반응 높음");
  }

  // ④ channel_meta 연동 (manager_name / topic_tags) - 표시만
  const [manager, setManager] = React.useState("");
  const [topicTags, setTopicTags] = React.useState<string[]>([]);
  const [loadingMeta, setLoadingMeta] = React.useState(false);

  React.useEffect(() => {
    if (!channelId) return;
    (async () => {
      setLoadingMeta(true);
      const { data, error } = await supabase
        .from("channel_meta" as any)
        .select("manager_name, topic_tags")
        .eq("channel_id", channelId)
        .maybeSingle();
      if (!error && data) {
        const metaData = data as any;
        setManager(metaData.manager_name ?? "");
        setTopicTags(metaData.topic_tags ?? []);
      } else {
        setManager("");
        setTopicTags([]);
      }
      setLoadingMeta(false);
    })();
  }, [channelId]);

  // 표시할 태그: channel_meta의 topic_tags 또는 자동 추출된 topicCandidates
  const displayTags = (topicTags?.length ? topicTags : topicCandidates) ?? [];
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

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

          {/* 우: 주제 & 특징 */}
          <div>
            <div className="text-sm text-muted-foreground mb-1">주제</div>
            
            {/* 토픽 태그 뱃지만 표시 */}
            {displayTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {displayTags.map((t, i) => {
                  const bg = pickTagColor(i);
                  const fg = textOn(bg);
                  return (
                    <span
                      key={`${t}-${i}`}
                      className={cn(
                        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
                        "border focus-visible:outline-none focus-visible:ring-2",
                        "focus-visible:ring-[var(--brand-ink,#1D348F)] focus-visible:ring-offset-0"
                      )}
                      style={{
                        backgroundColor: bg,
                        color: fg,
                        borderColor: bg
                      }}
                      title={t}
                    >
                      {t}
                    </span>
                  );
                })}
              </div>
            )}

            {/* 특징 태그 */}
            {!!traits.length && (
              <div className="mt-3 flex flex-wrap gap-2">
                {traits.map((t, i) => {
                  const bg = pickTagColor(i + displayTags.length);
                  const fg = textOn(bg);
                  return (
                    <span
                      key={`${t}-${i}`}
                      className={cn(
                        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium",
                        "border focus-visible:outline-none focus-visible:ring-2",
                        "focus-visible:ring-[var(--brand-ink,#1D348F)] focus-visible:ring-offset-0"
                      )}
                      style={{
                        backgroundColor: bg,
                        color: fg,
                        borderColor: bg
                      }}
                      title={t}
                    >
                      {t}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
