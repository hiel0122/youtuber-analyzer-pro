// YouTube incremental comment tracking
import type { SupabaseClient } from '@supabase/supabase-js';

type Supa = SupabaseClient<any, 'public', any>;

async function getUploadsPlaylistId(apiKey: string, channelId: string): Promise<string | null> {
  const url = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
  const j = await fetch(url).then(r => r.json());
  return j?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads ?? null;
}

export async function fetchAllVideoIdsFromUploads(apiKey: string, uploads: string): Promise<string[]> {
  const ids: string[] = [];
  let pageToken = '';
  
  do {
    const url = new URL('https://www.googleapis.com/youtube/v3/playlistItems');
    url.searchParams.set('part', 'contentDetails');
    url.searchParams.set('playlistId', uploads);
    url.searchParams.set('maxResults', '50');
    if (pageToken) url.searchParams.set('pageToken', pageToken);
    url.searchParams.set('key', apiKey);
    
    const j = await fetch(url).then(r => r.json());
    for (const it of (j.items || [])) {
      const vid = it?.contentDetails?.videoId;
      if (vid) ids.push(vid);
    }
    pageToken = j.nextPageToken || '';
  } while (pageToken);
  
  return ids;
}

export async function fetchVideoStatsBatched(apiKey: string, videoIds: string[]): Promise<any[]> {
  const out: any[] = [];
  
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    const url = new URL('https://www.googleapis.com/youtube/v3/videos');
    url.searchParams.set('part', 'statistics,status,snippet');
    url.searchParams.set('id', batch.join(','));
    url.searchParams.set('key', apiKey);
    
    const j = await fetch(url).then(r => r.json());
    if (j?.items?.length) out.push(...j.items);
    
    // Rate limit protection
    await new Promise(r => setTimeout(r, 60));
  }
  
  return out;
}

export async function ensureChannelRecord(
  supabase: Supa,
  apiKey: string,
  channelId: string,
  title?: string
) {
  // Check if channel exists
  const { data: ch } = await supabase
    .from('yta_channels')
    .select('*')
    .eq('channel_id', channelId)
    .maybeSingle();
  
  if (ch?.uploads_playlist_id) return ch;

  const uploads = await getUploadsPlaylistId(apiKey, channelId);
  const payload: any = {
    channel_id: channelId,
    title: title ?? ch?.title ?? null,
    uploads_playlist_id: uploads,
    updated_at: new Date().toISOString(),
  };
  
  const { data } = await supabase
    .from('yta_channels')
    .upsert(payload)
    .select()
    .single();
  
  return data;
}

export async function fullScanComments(
  supabase: Supa,
  apiKey: string,
  channelId: string
) {
  const ch = await ensureChannelRecord(supabase, apiKey, channelId);
  if (!ch?.uploads_playlist_id) throw new Error('uploads playlist not found');

  const ids = await fetchAllVideoIdsFromUploads(apiKey, ch.uploads_playlist_id);
  const stats = await fetchVideoStatsBatched(apiKey, ids);

  // Upsert video snapshots + calculate total
  let total = 0;
  const rows = stats.map((v: any) => {
    const vid = v.id;
    const published = v?.snippet?.publishedAt ?? null;
    const cc = Number(v?.statistics?.commentCount ?? 0);
    total += Number.isFinite(cc) ? cc : 0;
    
    return {
      channel_id: channelId,
      video_id: vid,
      published_at: published,
      comment_count: cc || 0,
      updated_at: new Date().toISOString()
    };
  });

  if (rows.length) {
    await supabase.from('yta_channel_videos').upsert(rows);
  }
  
  await supabase.from('yta_channels').upsert({
    channel_id: channelId,
    comments_total: total,
    last_full_scan_at: new Date().toISOString(),
    last_delta_scan_at: new Date().toISOString(),
    last_video_published_at: rows.length 
      ? rows.map(r => r.published_at).sort().slice(-1)[0] 
      : null,
    updated_at: new Date().toISOString(),
  });

  return { total, added: rows.length };
}

export async function deltaScanComments(
  supabase: Supa,
  apiKey: string,
  channelId: string,
  backfillWindow = 200  // Re-check recent N videos
) {
  const ch = await ensureChannelRecord(supabase, apiKey, channelId);
  if (!ch?.uploads_playlist_id) throw new Error('uploads playlist not found');

  // 1) Get known video_id list and latest upload timestamp from DB
  const { data: known } = await supabase
    .from('yta_channel_videos')
    .select('video_id,published_at,comment_count')
    .eq('channel_id', channelId)
    .order('published_at', { ascending: false });

  const knownMap = new Map((known || []).map(r => [r.video_id, r]));

  // 2) Fetch all video IDs from uploads playlist
  const allIds = await fetchAllVideoIdsFromUploads(apiKey, ch.uploads_playlist_id);
  
  // Recent N videos (always re-check for comment updates)
  const recentIds = allIds.slice(0, backfillWindow);
  
  // Brand new videos
  const newIds = allIds.filter(id => !knownMap.has(id));

  const target = Array.from(new Set([...recentIds, ...newIds]));
  
  if (!target.length) {
    await supabase.from('yta_channels').upsert({
      channel_id: channelId,
      last_delta_scan_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return { commentsDelta: 0, touched: 0, added: 0, totalAfter: ch.comments_total ?? 0 };
  }

  // 3) Fetch stats and calculate delta
  const stats = await fetchVideoStatsBatched(apiKey, target);
  let commentsDelta = 0;
  const upserts: any[] = [];

  for (const v of stats) {
    const vid = v.id;
    const published = v?.snippet?.publishedAt ?? null;
    const nowCount = Number(v?.statistics?.commentCount ?? 0) || 0;
    const prev = knownMap.get(vid)?.comment_count ?? 0;
    const diff = nowCount - prev;
    
    if (Number.isFinite(diff) && diff !== 0) commentsDelta += diff;
    
    upserts.push({
      channel_id: channelId,
      video_id: vid,
      published_at: published,
      comment_count: nowCount,
      updated_at: new Date().toISOString()
    });
  }

  if (upserts.length) {
    await supabase.from('yta_channel_videos').upsert(upserts);
  }

  const totalAfter = Number(ch.comments_total ?? 0) + commentsDelta;
  
  await supabase.from('yta_channels').upsert({
    channel_id: channelId,
    comments_total: totalAfter,
    last_delta_scan_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return {
    commentsDelta,
    touched: upserts.length,
    added: newIds.length,
    totalAfter
  };
}

export async function logRun(
  supabase: Supa,
  userId: string | undefined,
  channelId: string,
  kind: 'full' | 'delta',
  metrics: { added: number; touched: number; commentsDelta: number; totalAfter: number }
) {
  await supabase.from('yta_analysis_runs').insert({
    user_id: userId ?? null,
    channel_id: channelId,
    run_type: kind,
    finished_at: new Date().toISOString(),
    added_videos: metrics.added ?? 0,
    touched_videos: metrics.touched ?? 0,
    comments_delta: metrics.commentsDelta ?? 0,
    total_comments_after: metrics.totalAfter ?? 0
  });
}
