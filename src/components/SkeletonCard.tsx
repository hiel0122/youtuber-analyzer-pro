import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonCard() {
  return (
    <div className="bg-[#141414] rounded-xl p-4 border border-[#27272a]">
      {/* 상단: 아이콘 + 트렌드 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      
      {/* 중앙: 큰 숫자 */}
      <Skeleton className="h-8 w-24 mb-2" />
      
      {/* 하단: 설명 */}
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
