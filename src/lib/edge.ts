import { supabase } from "./supabase";
import { SyncResponse } from "./types";

export async function syncNewVideos(channelUrl: string): Promise<SyncResponse> {
  if (!channelUrl || !/^https?:\/\/(www\.)?youtube\.com|youtu\.be/.test(channelUrl)) {
    throw new Error('유효한 유튜브 채널 URL을 입력하세요.');
  }

  const { data, error } = await supabase.functions.invoke("sync-new-videos", {
    body: { channelKey: channelUrl },
  });

  if (error) {
    console.error('Edge Function error:', error);
    throw new Error(error.message || 'Edge Function 호출에 실패했습니다.');
  }

  if (!data?.ok) {
    throw new Error(data?.error || '알 수 없는 오류가 발생했습니다.');
  }

  return data as SyncResponse;
}
