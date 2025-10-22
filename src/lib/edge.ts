export async function syncNewVideos(channelUrl: string) {
  // Read from ENV first, then fall back to localStorage (Settings modal)
  const SUPABASE_URL =
    import.meta.env.VITE_SUPABASE_URL || 
    localStorage.getItem('ya_supabase_url') || 
    '';
  const SUPABASE_ANON_KEY =
    import.meta.env.VITE_SUPABASE_ANON_KEY || 
    localStorage.getItem('ya_supabase_anon') || 
    '';

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('환경변수(VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)가 설정되지 않았습니다. Settings에서 확인하세요.');
  }

  if (!channelUrl || !/^https?:\/\/(www\.)?youtube\.com|youtu\.be/.test(channelUrl)) {
    throw new Error('유효한 유튜브 채널 URL을 입력하세요.');
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/sync-new-videos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ channelKey: channelUrl }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    
    // Handle specific error codes
    if (res.status === 401 || res.status === 403) {
      throw new Error('키가 없거나 잘못되었습니다. Settings에서 Supabase URL/Anon Key를 확인하세요.');
    } else if (res.status === 404) {
      throw new Error('Edge Function(sync-new-videos)이 배포되지 않았거나 이름이 다릅니다.');
    } else if (res.status >= 500) {
      throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도하세요.');
    }
    
    throw new Error(`Edge Function 호출 실패: ${res.status} ${text}`);
  }

  return res.json();
}
