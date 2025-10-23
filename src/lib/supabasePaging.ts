import { getSupabaseClient } from "@/lib/supabaseClient";

export const PAGE_SIZE = 1000;

/**
 * youtube_videos에서 channel_id 기준으로 모든 행을 페이지네이션으로 가져옵니다.
 * @param channelId 채널 ID
 * @param columns   선택할 컬럼 문자열 (예: "*", "views,upload_date,is_short")
 * @param orderBy   정렬 기준 컬럼 (기본: upload_date desc)
 * @param ascending 오름차순 여부
 */
export async function fetchAllVideosByChannel<T = any>(
  channelId: string,
  columns: string,
  orderBy: string = "upload_date",
  ascending: boolean = false
): Promise<{ data: T[]; count: number }> {
  const supabase = getSupabaseClient();

  // 1) 총 개수 확인
  const { count: totalCount, error: countError } = await supabase
    .from("youtube_videos")
    .select("id", { count: "exact", head: true })
    .eq("channel_id", channelId);

  if (countError) throw countError;

  // 2) 페이지네이션으로 전부 수집
  const pages = Math.max(1, Math.ceil((totalCount ?? 0) / PAGE_SIZE));
  const all: T[] = [];

  for (let p = 0; p < pages; p++) {
    const from = p * PAGE_SIZE;
    const to = (p + 1) * PAGE_SIZE - 1;

    const { data, error } = await supabase
      .from("youtube_videos")
      .select(columns)
      .eq("channel_id", channelId)
      .order(orderBy, { ascending })
      .range(from, to);

    if (error) throw error;
    if (data && data.length) all.push(...(data as T[]));

    // 안전장치: 마지막 페이지 조기 종료
    if (!data || data.length < PAGE_SIZE) break;
  }

  return { data: all, count: totalCount ?? all.length };
}
