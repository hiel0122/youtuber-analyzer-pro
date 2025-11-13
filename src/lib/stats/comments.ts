import { createClient } from '@supabase/supabase-js';

type Supa = ReturnType<typeof createClient>;

export async function fetchCommentStats(supabase: Supa, channelId: string) {
  const { data, error } = await supabase
    .from('yta_channel_videos')
    .select('comment_count')
    .eq('channel_id', channelId);

  if (error) throw error;
  if (!data || data.length === 0) {
    return { total: 0, max: 0, min: 0, avg: 0, videos: 0 };
  }

  const arr = data.map((x: any) => Number(x.comment_count || 0));
  const total = arr.reduce((a, b) => a + b, 0);
  const nonZero = arr.filter(n => n > 0);
  const max = arr.length ? Math.max(...arr) : 0;
  const min = nonZero.length ? Math.min(...nonZero) : 0;       // 0(비공개/차단) 제외
  const avg = nonZero.length ? Math.round(nonZero.reduce((a, b) => a + b, 0) / nonZero.length) : 0;

  return { total, max, min, avg, videos: arr.length };
}
