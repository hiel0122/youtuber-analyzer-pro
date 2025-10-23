import React from "react";

function fmt(n: number) {
  return new Intl.NumberFormat().format(n);
}

export default function SyncProgress({
  progress,
  error,
  currentCount = 0,
  totalCount = 0,
}: {
  progress: number;
  error?: boolean;
  currentCount?: number;
  totalCount?: number;
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>
          {totalCount > 0
            ? `${fmt(currentCount)} / ${fmt(totalCount)} 영상`
            : "동기화 준비 중..."}
        </span>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>

      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 bg-muted/50 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              error ? "bg-destructive" : "bg-primary"
            }`}
            style={{ width: `${progress}%` }}
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>

      {currentCount > 0 && totalCount > 0 && currentCount < totalCount && (
        <div className="text-xs text-muted-foreground text-center">
          약 {Math.max(1, Math.ceil((totalCount - currentCount) / 50))} 페이지 남음
        </div>
      )}
    </div>
  );
}
