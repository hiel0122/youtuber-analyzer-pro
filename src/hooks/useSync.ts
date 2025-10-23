import { useCallback, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const animIdRef = useRef<number | undefined>();
  const startTimeRef = useRef<number>(0);

  const startSync = useCallback(async (channelInput: string) => {
    setError(null);
    setIsSyncing(true);
    setProgress(0);
    startTimeRef.current = performance.now();

    // requestAnimationFrame을 사용한 실시간 진행률 업데이트
    const tick = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      // 20%/sec 증가, 최대 95%
      const p = Math.min(95, Math.max(5, (elapsed / 1000) * 20));
      setProgress(p);
      animIdRef.current = requestAnimationFrame(tick);
    };
    animIdRef.current = requestAnimationFrame(tick);

    try {
      const { data, error } = await supabase.functions.invoke("sync-new-videos", {
        body: { channelKey: channelInput },
      });
      if (error) throw error;
      
      // 성공 시 100%로 스냅
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      setProgress(100);
    } catch (e: any) {
      // 실패 시 진행률 유지하고 에러 표시
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      setError(e?.message ?? "동기화 실패");
    } finally {
      // 500ms 후 종료
      setTimeout(() => {
        setIsSyncing(false);
        setProgress(0);
      }, 500);
    }
  }, []);

  return { isSyncing, progress, error, startSync };
}
