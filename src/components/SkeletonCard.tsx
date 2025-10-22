import React from "react";

export default function SkeletonCard({ className = "h-40" }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-gray-900 animate-pulse ${className}`} />
  );
}
