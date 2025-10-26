'use client';
import React from 'react';

type Video = {
  upload_date: string;
  duration?: string | null;
  topic?: string | null;
  views?: number | null;
  likes?: number | null;
};

type UploadFrequency =
  | { averages?: { perWeek?: number | null } }
  | undefined;

const parseDurationToSeconds = (d?: string | null) => {
  if (!d) return 0;
  const parts = d.split(':').map(Number);
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
  if (!videos?.length) return null;

  const firstUpload = videos?.length
    ? new Date(
        videos.reduce((min, v) => {
          const t = new Date(v.upload_date).getTime();
          return Math.min(min, isNaN(t) ? Infinity : t);
        }, Infinity),
      )
    : null;

  const period =
    firstUpload && isFinite(firstUpload.getTime()) ? calcPeriod(firstUpload) : null;

  const topicCounts = (videos || []).reduce<Record<string, number>>((acc, v) => {
    if (v.topic) acc[String(v.topic)] = (acc[String(v.topic)] || 0) + 1;
    return acc;
  }, {});
  const primaryTopic = Object.keys(topicCounts).length
    ? Object.entries(topicCounts).sort((a, b) => b[1] - a[1])[0][0]
    : undefined;

  const durations = (videos || [])
    .map((v) => parseDurationToSeconds(v.duration || undefined))
    .filter((n) => n > 0);
  const avgMin = durations.length
    ? durations.reduce((a, b) => a + b, 0) / durations.length / 60
    : 0;

  const traits: string[] = [];
  if (avgMin >= 8) traits.push('롱폼 중심');
  else if (avgMin > 0) traits.push('숏폼/쇼츠 중심');

  const perWeek = Number(uploadFrequency?.averages?.perWeek || 0);
  if (perWeek >= 2) traits.push('활발한 업로드');
  else if (perWeek >= 1) traits.push('주 1회');
  else if (perWeek > 0) traits.push('비정기');

  const withStats = (videos || []).filter(
    (v) => (v.views || 0) > 0 && (v.likes || 0) >= 0,
  );
  if (withStats.length) {
    const likeRatio =
      withStats.reduce(
        (sum, v) => sum + (((v.likes || 0) / (v.views || 1)) * 100),
        0,
      ) / withStats.length;
    if (likeRatio >= 3) traits.push('좋아요 반응 높음');
  }

  return (
    <div className="w-full rounded-2xl bg-slate-900/40 ring-1 ring-white/10 p-5 md:p-6 mb-6">
      <div className="flex items-start gap-5 md:gap-8">
        <div className="shrink-0 grid place-items-center h-14 w-14 rounded-full bg-violet-500/20 text-violet-300 text-xl font-semibold">
          {(channelName?.trim()?.[0] || '?').toUpperCase()}
        </div>

        <div className="flex-1 grid md:grid-cols-3 gap-4">
          {/* 좌측: 채널 기본 정보 */}
          <div>
            <div className="text-lg font-semibold">
              {channelName || 'YouTube Channel'}
            </div>
            <div className="text-sm text-slate-400">관리자: {managerName || '—'}</div>
          </div>

          {/* 가운데: 운영기간 */}
          <div className="text-sm">
            <div className="text-slate-400 mb-1">운영기간</div>
            <div className="font-medium">
              {period ? `${period.years}년 ${period.months}개월 ${period.days}일` : '—'}
            </div>
            <div className="text-slate-400">
              {firstUpload
                ? `${firstUpload.toISOString().slice(0, 10)} ~ ${new Date()
                    .toISOString()
                    .slice(0, 10)}`
                : ''}
            </div>
          </div>

          {/* 우측: 주제 + 특징 */}
          <div className="text-sm">
            <div className="text-slate-400 mb-1">주제</div>
            <div className="font-medium">{primaryTopic || '—'}</div>

            {!!traits.length && (
              <div className="mt-2 flex flex-wrap gap-2">
                {traits.map((t, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300"
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
