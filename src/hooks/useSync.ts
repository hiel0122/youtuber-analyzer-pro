import { useCallback, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getSupabaseClient } from "@/lib/supabaseClient";

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentCount, setCurrentCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pollIntervalRef = useRef<number | undefined>();
  const channelIdRef = useRef<string>("");

  const startSync = useCallback(async (channelInput: string, fullSync = true) => {
    setError(null);
    setIsSyncing(true);
    setProgress(0);
    setCurrentCount(0);
    setTotalCount(0);

    try {
      // Edge Function 호출 시작
      const syncPromise = supabase.functions.invoke("sync-new-videos", {
        body: { channelKey: channelInput, fullSync },
      });

      // 채널 ID 추출 (간단한 정규식 체크)
      let estimatedChannelId = channelInput;
      if (channelInput.includes('youtube.com/@')) {
        // @핸들은 Edge Function이 처리
        estimatedChannelId = channelInput;
      } else if (channelInput.includes('UC')) {
        const match = channelInput.match(/UC[\w-]+/);
        if (match) estimatedChannelId = match[0];
      }

      // DB에서 기존 채널 정보 확인 (빠른 응답)
      try {
        const { data: channelData } = await getSupabaseClient()
          .from("youtube_channels")
          .select("channel_id, total_videos")
          .or(`channel_id.eq.${estimatedChannelId},channel_name.ilike.%${estimatedChannelId}%`)
          .maybeSingle();

        if (channelData?.channel_id) {
          channelIdRef.current = channelData.channel_id;
          const estimatedTotal = channelData.total_videos || 1000;
          setTotalCount(estimatedTotal);

          // 폴링 시작 (2초마다 DB 확인)
          pollIntervalRef.current = window.setInterval(async () => {
            try {
              const { count } = await getSupabaseClient()
                .from("youtube_videos")
                .select("video_id", { count: "exact", head: true })
                .eq("channel_id", channelIdRef.current);

              if (count !== null) {
                setCurrentCount(count);
                const realProgress = Math.min(95, (count / estimatedTotal) * 100);
                setProgress(realProgress);
              }
            } catch (e) {
              console.error("Polling error:", e);
            }
          }, 2000);
        }
      } catch (e) {
        console.log("채널 정보 가져오기 실패, 기본 진행률 사용");
      }

      // Edge Function 완료 대기
      const { data, error: syncError } = await syncPromise;
      
      if (syncError) throw syncError;

      // 완료 시 100%
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
      }
      setProgress(100);

      // 최종 개수 업데이트
      if (data?.inserted_or_updated) {
        setCurrentCount(data.inserted_or_updated);
      }

    } catch (e: any) {
      if (pollIntervalRef.current) {
        window.clearInterval(pollIntervalRef.current);
      }
      setError(e?.message ?? "동기화 실패");
    } finally {
      setTimeout(() => {
        setIsSyncing(false);
        setProgress(0);
        setCurrentCount(0);
        setTotalCount(0);
      }, 1000);
    }
  }, []);

  return { isSyncing, progress, currentCount, totalCount, error, startSync };
}
