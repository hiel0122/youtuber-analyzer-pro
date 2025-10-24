import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

const YT_BASE = 'https://www.googleapis.com/youtube/v3';

// ========== 헬퍼 함수들 ==========

// Duration 문자열(H:MM:SS)을 초로 변환
function durationToSeconds(duration: string): number {
  if (!duration) return 0;
  const parts = duration.split(':').map(p => parseInt(p, 10));
  if (parts.length === 3) {
    // H:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    // M:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    // SS
    return parts[0];
  }
  return 0;
}

// ISO 8601 duration → H:MM:SS
function iso8601ToHMS(iso: string): string {
  if (!iso) return "";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const h = Number(m?.[1] || 0);
  const min = Number(m?.[2] || 0);
  const s = Number(m?.[3] || 0);
  const pad = (x: number) => x.toString().padStart(2, "0");
  return h ? `${h}:${pad(min)}:${pad(s)}` : `${min}:${pad(s)}`;
}

// ✅ 수정: 채널 ID 해석 (forHandle @ 제거 + /c/, /user/ 지원)
async function resolveChannelId(input: string, apiKey: string) {
  const v = input.trim();
  
  // 1) Already a channel ID (UC...)
  const mUC = v.match(/(UC[0-9A-Za-z_-]{22})/);
  if (mUC) {
    const url = `${YT_BASE}/channels?part=snippet&id=${mUC[1]}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Channel ID lookup failed:', res.status);
      return null;
    }
    const json = await res.json();
    const item = json?.items?.[0];
    return item ? { channelId: mUC[1], title: item.snippet?.title ?? '' } : null;
  }

  // 2) Handle (@handle) - ✅ @ 제거
  const mHandle = v.match(/@([a-zA-Z0-9._-]+)/);
  if (mHandle) {
    const handleName = mHandle[1]; // @ 제거
    const url = `${YT_BASE}/channels?part=snippet&forHandle=${handleName}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      console.error('Handle lookup failed:', res.status, handleName);
      return null;
    }
    const json = await res.json();
    const item = json?.items?.[0];
    return item ? { channelId: item.id, title: item.snippet?.title ?? '' } : null;
  }

  // 3) Legacy /channel/ URL
  const mChan = v.match(/\/channel\/(UC[0-9A-Za-z_-]{22})/);
  if (mChan) {
    const url = `${YT_BASE}/channels?part=snippet&id=${mChan[1]}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const item = json?.items?.[0];
    return item ? { channelId: mChan[1], title: item.snippet?.title ?? '' } : null;
  }

  // 4) ✅ 추가: Custom URL (/c/customname)
  const mCustom = v.match(/\/c\/([^\/\?]+)/);
  if (mCustom) {
    const url = `${YT_BASE}/channels?part=snippet&forUsername=${mCustom[1]}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const item = json?.items?.[0];
    return item ? { channelId: item.id, title: item.snippet?.title ?? '' } : null;
  }

  // 5) ✅ 추가: User URL (/user/username)
  const mUser = v.match(/\/user\/([^\/\?]+)/);
  if (mUser) {
    const url = `${YT_BASE}/channels?part=snippet&forUsername=${mUser[1]}&key=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    const item = json?.items?.[0];
    return item ? { channelId: item.id, title: item.snippet?.title ?? '' } : null;
  }

  // 6) Last resort: search
  console.warn('Using search API as last resort for:', v);
  const url = `${YT_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(v)}&maxResults=1&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = await res.json();
  const item = json?.items?.[0];
  if (item) {
    console.warn('Found channel via search, please verify:', item.snippet?.title);
  }
  return item ? { channelId: item.snippet.channelId, title: item.snippet?.title ?? '' } : null;
}

async function getUploadsPlaylistId(channelId: string, apiKey: string) {
  const url = `${YT_BASE}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to get channel details: ${res.status}`);
  }
  const data = await res.json();
  if (data.error) {
    throw new Error(`YouTube API Error: ${data.error.message}`);
  }
  const item = data?.items?.[0];
  return item?.contentDetails?.relatedPlaylists?.uploads || null;
}

async function listNewUploads(uploadsPlaylistId: string, apiKey: string, sinceISO?: string) {
  const MAX_ALL_LIMIT = 100000; // Safety limit for full sync
  const endpoint = `${YT_BASE}/playlistItems`;
  const items: any[] = [];
  let pageToken = "";

  while (true) {
    const url = new URL(endpoint);
    url.searchParams.set("part", "contentDetails,snippet");
    url.searchParams.set("playlistId", uploadsPlaylistId);
    url.searchParams.set("maxResults", "50");
    if (pageToken) url.searchParams.set("pageToken", pageToken);
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString());
    const data = await res.json();

    for (const it of data?.items ?? []) {
      const vid = it?.contentDetails?.videoId;
      const publishedAt = it?.contentDetails?.videoPublishedAt || it?.snippet?.publishedAt;
      if (!vid || !publishedAt) continue;

      items.push({
        videoId: vid,
        title: it?.snippet?.title ?? "",
        publishedAt
      });
      
      // Safety limit check
      if (items.length >= MAX_ALL_LIMIT) {
        console.warn(`Reached MAX_ALL_LIMIT: ${MAX_ALL_LIMIT}`);
        return items;
      }
    }

    pageToken = data?.nextPageToken ?? "";
    if (!pageToken) break;
  }

  return items;
}

async function fetchVideosStats(videoIds: string[], apiKey: string) {
  if (videoIds.length === 0) return [];
  const endpoint = `${YT_BASE}/videos`;
  const chunks: string[][] = [];
  for (let i = 0; i < videoIds.length; i += 50) chunks.push(videoIds.slice(i, i + 50));

  const out: any[] = [];
  for (const chunk of chunks) {
    const url = `${endpoint}?part=snippet,contentDetails,statistics&id=${chunk.join(",")}&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();

    for (const v of data?.items ?? []) {
      out.push({
        id: v.id,
        title: v?.snippet?.title ?? "",
        duration: iso8601ToHMS(v?.contentDetails?.duration),
        viewCount: Number(v?.statistics?.viewCount ?? 0),
        likeCount: v?.statistics?.likeCount ? Number(v.statistics.likeCount) : undefined
      });
    }
  }

  return out;
}

async function getChannelStats(channelId: string, apiKey: string) {
  const url = `${YT_BASE}/channels?part=statistics,snippet&id=${channelId}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  const item = data?.items?.[0];

  if (!item) {
    return {
      subscriberCount: 0,
      videoCount: 0,
      viewCount: 0,
      title: ''
    };
  }

  return {
    subscriberCount: Number(item?.statistics?.subscriberCount ?? 0),
    videoCount: Number(item?.statistics?.videoCount ?? 0),
    viewCount: Number(item?.statistics?.viewCount ?? 0),
    title: item?.snippet?.title ?? ''
  };
}

// ✅ 신규: 업로드 빈도 통계 계산
async function calculateUploadStats(supabase: any, channelId: string) {
  const now = new Date();
  const twelveWeeksAgo = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7 * 12);
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setFullYear(now.getFullYear() - 1);

  // upload_date는 'YYYY-MM-DD' 문자열 형식
  const format = (date: Date) => date.toISOString().split('T')[0];

  // 전체: 최근 12주
  const { count: uploads12w } = await supabase
    .from('youtube_videos')
    .select('video_id', { count: 'exact', head: true })
    .eq('channel_id', channelId)
    .gte('upload_date', format(twelveWeeksAgo));

  // 전체: 최근 12개월
  const { count: uploads12m } = await supabase
    .from('youtube_videos')
    .select('video_id', { count: 'exact', head: true })
    .eq('channel_id', channelId)
    .gte('upload_date', format(twelveMonthsAgo));

  // 최근 12개월 모든 비디오 가져오기 (duration으로 분류)
  const { data: videos12m } = await supabase
    .from('youtube_videos')
    .select('duration')
    .eq('channel_id', channelId)
    .gte('upload_date', format(twelveMonthsAgo));

  // duration을 초로 변환하여 롱폼/숏폼 분류
  let uploads12mLong = 0;
  let uploads12mShort = 0;

  for (const video of videos12m || []) {
    const seconds = durationToSeconds(video.duration || '');
    if (seconds > 60) {
      uploads12mLong++;
    } else if (seconds > 0) {
      uploads12mShort++;
    }
  }

  const round2 = (n: number) => Number((Math.max(n, 0)).toFixed(2));
  const perMonthAvg = round2((uploads12m || 0) / 12);

  return {
    windowWeeks: 12,
    windowMonths: 12,
    uploads: {
      last12Weeks: uploads12w || 0,
      last12Months: uploads12m || 0,
      last12MonthsLong: uploads12mLong,
      last12MonthsShort: uploads12mShort
    },
    averages: {
      perWeek: round2((uploads12w || 0) / 12),
      perMonth: perMonthAvg,
      perQuarter: round2(perMonthAvg * 3),
      perYear: uploads12m || 0,
      perYearAvg: round2(perMonthAvg * 12),
      perMonthGeneral: round2(uploads12mLong / 12),
      perMonthShorts: round2(uploads12mShort / 12)
    }
  };
}

// ========== 메인 핸들러 ==========

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 환경 변수 확인
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY');
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !YOUTUBE_API_KEY) {
      console.error('Missing environment variables');
      return new Response(JSON.stringify({
        ok: false,
        error: 'Missing env: SUPABASE_URL / SERVICE_ROLE_KEY / YOUTUBE_API_KEY'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Environment variables loaded successfully');

    // 요청 파싱
    const body = await req.json().catch(() => ({}));
    const channelKey = body?.channelKey || body?.channel;
    const rawId = body?.channelId;
    const fullSync = body?.fullSync ?? true;
    const quickCheck = body?.quickCheck ?? false; // ✅ quickCheck 플래그

    if (!channelKey && !rawId) {
      console.error('Missing required parameters');
      return new Response(JSON.stringify({
        ok: false,
        error: 'channelKey or channelId is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Sync request:', { channelKey, rawId, fullSync, quickCheck });

    // ✅ quickCheck 모드: 채널 ID와 총 영상수만 빠르게 반환
    if (quickCheck) {
      let channelId = rawId;
      let resolvedTitle = "";
      let totalVideos = 0;

      if (!channelId) {
        const resolved = await resolveChannelId(channelKey, YOUTUBE_API_KEY);
        if (!resolved) {
          console.error('Cannot resolve channel id for:', channelKey);
          return new Response(JSON.stringify({
            ok: false,
            error: 'Cannot resolve channel id'
          }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        channelId = resolved.channelId;
        resolvedTitle = resolved.title;
      }

      // 채널 통계에서 총 영상수 가져오기
      const channelStats = await getChannelStats(channelId, YOUTUBE_API_KEY);
      totalVideos = channelStats.videoCount;

      console.log('QuickCheck complete:', { channelId, totalVideos });

      return new Response(JSON.stringify({
        ok: true,
        mode: "quickCheck",
        channelId,
        totalVideos
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // 1) 채널 ID 해석
    let channelId = rawId;
    let resolvedTitle = "";

    if (!channelId) {
      const resolved = await resolveChannelId(channelKey, YOUTUBE_API_KEY);
      if (!resolved) {
        console.error('Cannot resolve channel id for:', channelKey);
        return new Response(JSON.stringify({
          error: 'Cannot resolve channel id'
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      channelId = resolved.channelId;
      resolvedTitle = resolved.title;
    }

    console.log('Resolved channel:', { channelId, resolvedTitle });

    // 2) Supabase 클라이언트 생성
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // 3) ✅ 기존 기능: 채널 통계 가져오기 및 저장
    const channelStats = await getChannelStats(channelId, YOUTUBE_API_KEY);
    console.log('Channel stats:', channelStats);

    const { error: channelError } = await supabase
      .from('youtube_channels')
      .upsert({
        channel_id: channelId,
        channel_name: channelStats.title || resolvedTitle,
        subscriber_count: channelStats.subscriberCount,
        total_videos: channelStats.videoCount,
        total_views: channelStats.viewCount,
        last_updated: new Date().toISOString()
      }, { onConflict: 'channel_id' });

    if (channelError) {
      console.error('Error saving channel info:', channelError);
    }

    console.log('Channel info saved to database');

    // 4) ✅ 전체 동기화 모드 - sinceISO 비활성화
    // 항상 모든 영상을 수집하므로 증분 동기화 코드는 사용하지 않음
    const sinceISO = undefined; // ✅ 항상 undefined로 전체 수집
    console.log('Full sync mode enabled - fetching all videos');

    // 5) ✅ 기존 기능: 업로드 플레이리스트 가져오기
    const uploadsId = await getUploadsPlaylistId(channelId, YOUTUBE_API_KEY);
    if (!uploadsId) {
      console.error('No uploads playlist found for channel:', channelId);
      return new Response(JSON.stringify({
        error: 'No uploads playlist found'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Uploads playlist:', uploadsId);

    // 6) ✅ 전체 비디오 가져오기 (페이지네이션 끝까지)
    const allItems = await listNewUploads(uploadsId, YOUTUBE_API_KEY, sinceISO);
    console.log('Total videos fetched:', allItems.length);

    let insertedOrUpdated = 0;

    if (allItems.length > 0) {
      // 7) ✅ 기존 기능: 비디오 통계 가져오기
      const stats = await fetchVideosStats(allItems.map(v => v.videoId), YOUTUBE_API_KEY);
      const statsMap = new Map(stats.map(x => [x.id, x]));

      // 8) ✅ 기존 기능: RPC로 비디오 저장 (upsert로 중복 방지)
      const rows = allItems.map(v => {
        const s = statsMap.get(v.videoId);
        return {
          video_id: v.videoId,
          channel_id: channelId,
          topic: '',
          title: s?.title || v.title,
          presenter: '',
          views: s?.viewCount ?? 0,
          likes: s?.likeCount ?? null,
          dislikes: null,
          upload_date: v.publishedAt.slice(0, 10),
          duration: s?.duration ?? '',
          url: `https://www.youtube.com/watch?v=${v.videoId}`
        };
      });

      console.log('Upserting rows:', rows.length);

      const { data: affected, error: rpcErr } = await supabase.rpc('upsert_videos', {
        p_rows: rows
      });

      if (rpcErr) {
        console.error('RPC error:', rpcErr);
        throw rpcErr;
      }

      insertedOrUpdated = affected ?? rows.length;
      console.log('Upsert complete:', insertedOrUpdated);
    }

    // 9) ✅ 신규 기능: 업로드 빈도 통계 계산
    const uploadFrequency = await calculateUploadStats(supabase, channelId);
    console.log('Upload frequency calculated:', uploadFrequency);

    // 10) ✅ 신규 기능: 통계 DB에 저장
    const { error: statsError } = await supabase
      .from('channel_upload_stats')
      .upsert({
        channel_id: channelId,
        window_weeks: uploadFrequency.windowWeeks,
        window_months: uploadFrequency.windowMonths,
        uploads_12w: uploadFrequency.uploads.last12Weeks,
        uploads_12m: uploadFrequency.uploads.last12Months,
        uploads_12m_long: uploadFrequency.uploads.last12MonthsLong,
        uploads_12m_short: uploadFrequency.uploads.last12MonthsShort,
        avg_per_week: uploadFrequency.averages.perWeek,
        avg_per_month: uploadFrequency.averages.perMonth,
        avg_per_month_long: uploadFrequency.averages.perMonthGeneral,
        avg_per_month_short: uploadFrequency.averages.perMonthShorts,
        computed_at: new Date().toISOString()
      }, { onConflict: 'channel_id' });

    if (statsError) {
      console.error('Error saving upload stats:', statsError);
    } else {
      console.log('Upload stats saved to database');
    }

    // 11) ✅ 응답 (mode: "full" 추가)
    return new Response(JSON.stringify({
      ok: true,
      mode: "full", // ✅ 항상 전체 동기화 모드
      channelId,
      title: resolvedTitle || channelStats.title,
      fetched: allItems.length, // ✅ 총 수집된 영상 수
      upserted: insertedOrUpdated, // ✅ DB에 저장된 수
      inserted_or_updated: insertedOrUpdated, // 하위 호환성 유지
      newest_uploaded_at: allItems[0]?.publishedAt,
      channelStats: {
        subscriberCount: channelStats.subscriberCount,
        videoCount: channelStats.videoCount,
        viewCount: channelStats.viewCount
      },
      uploadFrequency // ✅ 신규 추가
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (e: any) {
    console.error('Error:', e);
    return new Response(JSON.stringify({
      ok: false,
      error: e?.message ?? 'unknown error',
      stack: e?.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
