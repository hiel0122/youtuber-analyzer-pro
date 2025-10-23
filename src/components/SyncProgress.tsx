import React from "react";
import { formatInt } from "@/utils/format";

export default function SyncProgress({ 
  progress, 
  error,
  currentCount = 0,
  totalCount = 0
}: { 
  progress: number; 
  error?: boolean;
  currentCount?: number;
  totalCount?: number;
}) {
  return (
    <div className="space-y-2">
      {/* 현재/전체 개수 표시 */}
      {totalCount > 0 && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            {currentCount > 0 
              ? `${formatInt(currentCount)} / ${formatInt(totalCount)} 영상`
              : '동기화 준비 중...'
            }
          </span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
      )}

      {/* 진행률 바 */}
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 bg-muted/50 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              error ? 'bg-destructive' : 'bg-primary'
            }`}
            style={{ width: `${progress}%` }}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {/* 추정 남은 시간 */}
      {currentCount > 0 && totalCount > 0 && currentCount < totalCount && (
        <div className="text-xs text-muted-foreground text-center">
          약 {Math.ceil((totalCount - currentCount) / 50)} 페이지 남음
        </div>
      )}
    </div>
  );
}
