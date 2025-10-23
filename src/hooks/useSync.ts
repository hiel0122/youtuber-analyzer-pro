import { useCallback, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { resolveChannelId, syncNewVideos } from "@/lib/edge";

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCount, setCurrentCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const pollRef = useRef<number | null>(null);

  const clearPoll = () => {
    if (pollRef.current !== null) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startSync = useCallback(async (channelInput: string, fullSync = true) => {
    setIsSyncing(true);
    setProgress(0);
    setCurrentCount(0);
    setTotalCount(0);
    setError(null);
    clearPoll();

    try {
      // 1) 채널ID & 총영상수 선확인
      const { channelId, totalVideos } = await resolveChannelId(channelInput).catch(() => ({
        channelId: "",
        totalVideos: 0,
      }));
      const estimatedTotal = totalVideos && totalVideos > 0 ? totalVideos : 1000;
      setTotalCount(estimatedTotal);

      // 2) 폴링 시작 (2초마다 현재 저장된 개수)
      if (channelId) {
        pollRef.current = window.setInterval(async () => {
          try {
            const { count } = await supabase
              .from("youtube_videos")
              .select("video_id", { count: "exact", head: true })
              .eq("channel_id", channelId);

            if (typeof count === "number") {
              setCurrentCount(count);
              const pct = Math.min(95, Math.floor((count / estimatedTotal) * 100));
              setProgress(isFinite(pct) ? pct : 0);
            }
          } catch {
            // 폴링 에러는 무시(진행)
          }
        }, 2000);
      }

      // 3) 실제 동기화 1회 호출
      const res = await syncNewVideos(channelInput, fullSync);

      // 4) 완료 처리
      clearPoll();
      setProgress(100);
      if (typeof res.inserted_or_updated === "number") {
        setCurrentCount(res.inserted_or_updated);
      }
    } catch (e: any) {
      clearPoll();
      setError(e?.message || "동기화 실패");
    } finally {
      // UI 여유시간 후 리셋(필요 시 조정)
      setTimeout(() => {
        setIsSyncing(false);
      }, 600);
    }
  }, []);

  return { isSyncing, progress, currentCount, totalCount, error, startSync };
}
