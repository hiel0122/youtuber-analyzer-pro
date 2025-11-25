import { Skeleton } from "@/components/ui/skeleton";

export function LoadingChart({ height = 350 }: { height?: number }) {
  return (
    <div className="space-y-4">
      {/* 범례 */}
      <div className="flex gap-4 justify-center">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
      
      {/* 차트 영역 */}
      <div className="flex items-end justify-between gap-2" style={{ height }}>
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton
            key={index}
            className="flex-1"
            style={{
              height: `${Math.random() * 60 + 40}%`,
            }}
          />
        ))}
      </div>
      
      {/* X축 라벨 */}
      <div className="flex justify-between">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-12" />
        ))}
      </div>
    </div>
  );
}
