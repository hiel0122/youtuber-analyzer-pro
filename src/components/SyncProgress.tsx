import React from "react";

export default function SyncProgress({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-gray-800 rounded-xl h-3 overflow-hidden">
      <div
        className="h-full bg-green-500 transition-all duration-300"
        style={{ width: `${progress}%` }}
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
