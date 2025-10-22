import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

// YouTube API utilities
const YT_BASE = 'https://www.googleapis.com/youtube/v3';

async function resolveChannelId(input: string, apiKey: string): Promise<{ channelId: string; title: string } | null> {
  const v = input.trim();
  
  // Already a channel ID (UC...)
  const mUC = v.match(/(UC[0-9A-Za-z_-]{22})/);
  if (mUC) {
    const url = `${YT_BASE}/channels?part=snippet&id=${mUC[1]}&key=${apiKey}`;
    const res = await fetch(url);
    const json = await res.json();
    const item = json?.items?.[0];
    return item ? { channelId: mUC[1], title: item.snippet?.title ?? '' } : null;
  }

  // Handle (@handle)
  const mHandle = v.match(/@([a-zA-Z0-9._-]+)/);
  if (mHandle) {
    const url = `${YT_BASE}/search?part=snippet&type=channel&q=%40${mHandle[1]}&maxResults=1&key=${apiKey}`;
    const res = await fetch(url);
    const json = await res.json();
    const item = json?.items?.[0];
    return item ? { channelId: item.snippet.channelId, title: item.snippet.title ?? '' } : null;
  }

  // Legacy /channel/ URL
  const mChan = v.match(/\/channel\/(UC[0-9A-Za-z_-]{22})/);
  if (mChan) {
    const url = `${YT_BASE}/channels?part=snippet&id=${mChan[1]}&key=${apiKey}`;
    const res = await fetch(url);
    const json = await res.json();
    const item = json?.items?.[0];
    return item ? { channelId: mChan[1], title: item.snippet?.title ?? '' } : null;
  }

  // Last resort: search
  const url = `${YT_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(v)}&maxResults=1&key=${apiKey}`;
  const res = await fetch(url);
  const json = await res.json();
  const item = json?.items?.[0];
  return item ? { channelId: item.snippet.channelId, title: item.snippet.title ?? '' } : null;
}

async function getUploadsPlaylistId(channelId: string, apiKey: string): Promise<string | null> {
  const url = `${YT_BASE}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  const item = data?.items?.[0];
  return item?.contentDetails?.relatedPlaylists?.uploads || null;
}

function iso8601ToHMS(iso?: string): string {
  if (!iso) return "";
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const h = Number(m?.[1] || 0);
  const min = Number(m?.[2] || 0);
  const s = Number(m?.[3] || 0);
  const pad = (x: number) => x.toString().padStart(2, "0");
  return h ? `${h}:${pad(min)}:${pad(s)}` : `${min}:${pad(s)}`;
}

async function listNewUploads(
  uploadsPlaylistId: string,
  apiKey: string,
  sinceISO?: string
): Promise<Array<{ videoId: string; title: string; publishedAt: string }>> {
  const endpoint = `${YT_BASE}/playlistItems`;
  const items: Array<{ videoId: string; title: string; publishedAt: string }> = [];
  let pageToken = "";
  let keep = true;

  while (keep) {
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

      if (sinceISO && new Date(publishedAt) <= new Date(sinceISO)) {
        keep = false;
        break;
      }
      items.push({ videoId: vid, title: it?.snippet?.title ?? "", publishedAt });
    }

    pageToken = data?.nextPageToken ?? "";
    if (!pageToken) break;
  }

  return items;
}

async function fetchVideosStats(
  videoIds: string[],
  apiKey: string
): Promise<Array<{ id: string; title: string; duration: string; viewCount: number; likeCount?: number }>> {
  if (videoIds.length === 0) return [];
  const endpoint = `${YT_BASE}/videos`;
  const chunks: string[][] = [];
  for (let i = 0; i < videoIds.length; i += 50) chunks.push(videoIds.slice(i, i + 50));

  const out: Array<{ id: string; title: string; duration: string; viewCount: number; likeCount?: number }> = [];
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
        likeCount: v?.statistics?.likeCount ? Number(v.statistics.likeCount) : undefined,
      });
    }
  }
  return out;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Check environment variables
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SERVICE_ROLE_KEY');
    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');

    if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !YOUTUBE_API_KEY) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'Missing env: SUPABASE_URL / SERVICE_ROLE_KEY / YOUTUBE_API_KEY',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Environment variables loaded successfully');

    // Parse request - support both channelKey and channel
    const { channelKey, channel, channelId: rawId } = await req.json().catch(() => ({}));
    
    const channelInput = channelKey || channel;
    
    if (!channelInput && !rawId) {
      return new Response(
        JSON.stringify({ ok: false, error: 'channelKey or channelId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sync request:', { channelKey: channelInput, rawId });

    // 1) Resolve channel ID
    let channelId = rawId as string | undefined;
    let resolvedTitle = "";
    if (!channelId) {
      const resolved = await resolveChannelId(channelInput, YOUTUBE_API_KEY);
      if (!resolved) {
        return new Response(
          JSON.stringify({ error: 'Cannot resolve channel id' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      channelId = resolved.channelId;
      resolvedTitle = resolved.title;
    }

    console.log('Resolved channel:', { channelId, resolvedTitle });

    // 2) Create Supabase client
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 3) Get last upload date
    const { data: lastRow, error: lastErr } = await supabase
      .from('youtube_videos')
      .select('upload_date')
      .eq('channel_id', channelId)
      .order('upload_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastErr) throw lastErr;
    
    const sinceISO = lastRow?.upload_date ? new Date(lastRow.upload_date).toISOString() : undefined;
    console.log('Last upload:', { sinceISO });

    // 4) Get uploads playlist
    const uploadsId = await getUploadsPlaylistId(channelId, YOUTUBE_API_KEY);
    if (!uploadsId) {
      return new Response(
        JSON.stringify({ error: 'No uploads playlist found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Uploads playlist:', uploadsId);

    // 5) Fetch new videos
    const newItems = await listNewUploads(uploadsId, YOUTUBE_API_KEY, sinceISO);
    console.log('New videos found:', newItems.length);

    if (!newItems.length) {
      return new Response(
        JSON.stringify({
          ok: true,
          channelId,
          title: resolvedTitle,
          inserted: 0,
          message: 'no new videos',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6) Fetch stats
    const stats = await fetchVideosStats(newItems.map(v => v.videoId), YOUTUBE_API_KEY);
    const statsMap = new Map(stats.map(x => [x.id, x]));

    // 7) Prepare data
    const rows = newItems.map(v => {
      const s = statsMap.get(v.videoId);
      return {
        video_id: v.videoId,
        channel_id: channelId!,
        topic: '',
        title: s?.title || v.title,
        presenter: '',
        views: s?.viewCount ?? 0,
        likes: s?.likeCount ?? null,
        dislikes: null,
        upload_date: v.publishedAt.slice(0, 10),
        duration: s?.duration ?? '',
        url: `https://www.youtube.com/watch?v=${v.videoId}`,
      };
    });

    console.log('Upserting rows:', rows.length);

    // 8) Upsert to database
    const { data: affected, error: rpcErr } = await supabase.rpc('upsert_videos', { p_rows: rows });
    if (rpcErr) {
      console.error('RPC error:', rpcErr);
      throw rpcErr;
    }

    console.log('Upsert complete:', affected);

    return new Response(
      JSON.stringify({
        ok: true,
        channelId,
        title: resolvedTitle,
        inserted_or_updated: affected ?? rows.length,
        newest_uploaded_at: newItems[0]?.publishedAt,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    console.error('Error:', e);
    return new Response(
      JSON.stringify({ error: e?.message ?? 'unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
