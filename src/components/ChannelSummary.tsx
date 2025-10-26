import React from "react";

type Video = {
  upload_date?: string | null;
  topic?: string | null;
  duration?: string | null; // "HH:MM:SS" | "MM:SS"
  views?: number | null;
  likes?: number | null;
};

type UploadFrequency = {
  averages?: {
    perWeek?: number;
  };
};

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

function ChannelSummary({
  channelName,
  managerName,
  videos,
  uploadFrequency,
}: {
  channelName?: string;
  managerName?: string;
  videos: Video[];
  uploadFrequency?: UploadFrequency;
}) {
  const hasVideos = Array.isArray(videos) && videos.length > 0;

  const firstUpload = hasVideos
    ? new Date(
        videos.reduce((min, v) => {
          const t = new Date(v.upload_date ?? "").getTime();
          return Math.min(min, isNaN(t) ? Infinity : t);
        }, Infinity),
      )
    : undefined;

  const period = firstUpload && isFinite(firstUpload.getTime()) ? calcPeriod(firstUpload) : undefined;

  const topicCounts = (videos || []).reduce<Record<string, number>>((acc, v) => {
    if (v.topic) acc[String(v.topic)] = (acc[String(v.topic)] || 0) + 1;
    return acc;
  }, {});
  const primaryTopic =
    Object.keys(topicCounts).length > 0
      ? Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0][0]
      : undefined;

  const durations = (videos || [])
    .map((v) => parseDurationToSeconds(v.duration))
    .filter((n) => n > 0);
  const avgMin = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length / 60 : 0;

  const traits: string[] = [];
  if (avgMin >= 8) traits.push("롱폼 중심");
  else if (avgMin > 0) traits.push("숏폼/쇼츠 중심");

  const perWeek = Number(uploadFrequency?.averages?.perWeek || 0);
  if (perWeek >= 2) traits.push("활발한 업로드");
  else if (perWeek >= 1) traits.push("주 1회");
  else if (perWeek > 0) traits.push("비정기");

  const withStats = (videos || []).filter((v) => (v.views || 0) > 0 && (v.likes || 0) >= 0);
  if (withStats.length) {
    const likeRatio =
      withStats.reduce((sum, v) => sum + (((v.likes || 0) / (v.views || 1)) * 100), 0) /
      withStats.length;
    if (likeRatio >= 3) traits.push("좋아요 반응 높음");
  }

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  return (
    <div className="rounded-2xl bg-slate-800/60 border border-slate-700 px-6 py-5 mb-6">
      <div className="flex items-start gap-4">
        {/* 아바타 */}
        <div className="h-12 w-12 rounded-xl bg-violet-600 flex items-center justify-center text-white text-lg font-semibold shrink-0">
          {(channelName?.trim()?.[0] || "?").toUpperCase()}
        </div>

        {/* 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* 좌: 기본 정보 */}
          <div>
            <div className="text-base text-slate-300">채널명</div>
            <div className="text-xl font-semibold text-white">{channelName || "—"}</div>
            <div className="mt-2 text-sm text-slate-400">관리자: {managerName || "—"}</div>
          </div>

          {/* 중: 운영기간 */}
          <div>
            <div className="text-base text-slate-300">운영기간</div>
            <div className="text-xl font-semibold text-white">
              {period ? `${period.years}년 ${period.months}개월 ${period.days}일` : "—"}
            </div>
            <div className="mt-2 text-sm text-slate-400">
              {firstUpload ? `${fmt(firstUpload)} ~ ${fmt(new Date())}` : "업로드 이력 없음"}
            </div>
          </div>

          {/* 우: 주제 & 특징 */}
          <div>
            <div className="text-base text-slate-300">주제</div>
            <div className="text-xl font-semibold text-white">{primaryTopic || "—"}</div>
            {traits.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {traits.map((t, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-full bg-slate-700/60 text-slate-200 border border-slate-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChannelSummary;
