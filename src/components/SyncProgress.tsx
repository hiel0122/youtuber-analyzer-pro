import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

interface SyncProgressProps {
  progress: number;
  currentCount: number;
  totalCount: number;
  startTime?: number;
  error?: boolean;
}

export default function SyncProgress({ 
  progress, 
  currentCount, 
  totalCount,
  startTime,
  error
}: SyncProgressProps) {
  const actualProgress = totalCount > 0 
    ? Math.round((currentCount / totalCount) * 1000) / 10
    : progress;
  
  const [estimatedSeconds, setEstimatedSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!startTime || currentCount === 0 || totalCount === 0 || currentCount < 10) {
      setEstimatedSeconds(null);
      return;
    }

    const elapsed = (Date.now() - startTime) / 1000;
    const rate = currentCount / elapsed;
    const remaining = (totalCount - currentCount) / rate;
    
    setEstimatedSeconds(Math.ceil(remaining));
  }, [currentCount, totalCount, startTime]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}초`;
    } else if (seconds < 3600) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}분 ${secs}초` : `${mins}분`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const mins = Math.floor((seconds % 3600) / 60);
      return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
    }
  };

  const progressMessage = totalCount > 0
    ? `${currentCount.toLocaleString('ko-KR')} / ${totalCount.toLocaleString('ko-KR')} 영상`
    : '동기화 준비 중...';

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card text-card-foreground border border-border rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{progressMessage}</span>
          <span className="text-sm font-bold tabular-nums text-primary">
            {actualProgress.toFixed(1)}%
          </span>
        </div>

        <Progress 
          value={actualProgress} 
          className="h-2.5 transition-all duration-300 ease-out"
        />

        {totalCount > 0 && estimatedSeconds !== null && estimatedSeconds > 0 && actualProgress < 100 && (
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span>예상 완료까지 약 {formatTime(estimatedSeconds)}</span>
          </div>
        )}

        {actualProgress >= 100 && (
          <div className="mt-3 text-xs text-green-500 font-medium text-center flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            분석 완료!
          </div>
        )}

        {error && (
          <div className="mt-3 text-xs text-destructive font-medium text-center">
            오류가 발생했습니다
          </div>
        )}
      </div>
    </div>
  );
}
