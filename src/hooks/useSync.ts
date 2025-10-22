import { useCallback, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const startSync = useCallback(async (channelInput: string) => {
    setError(null);
    setIsSyncing(true);
    setProgress(0);

    // 가짜 진행률 타이머 (Edge Function 완료까지 자연스러운 UX)
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setProgress((p) => (p < 85 ? p + 1 : p)); // 최대 85%까지만
    }, 60);

    try {
      const { data, error } = await supabase.functions.invoke("sync-new-videos", {
        body: { channelKey: channelInput },
      });
      if (error) throw error;
      // 성공 시 100%로
      setProgress(100);
    } catch (e: any) {
      setError(e?.message ?? "동기화 실패");
    } finally {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      // 약간의 지연 후 종료(100% 보이게)
      setTimeout(() => {
        setIsSyncing(false);
        setProgress(0);
      }, 600);
    }
  }, []);

  return { isSyncing, progress, error, startSync };
}
