import React from "react";

export default function SyncProgress({ progress, error }: { progress: number; error?: boolean }) {
  return (
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
      <span className="text-sm font-medium text-foreground min-w-[3ch] text-right">
        {Math.round(progress)}%
      </span>
    </div>
  );
}
