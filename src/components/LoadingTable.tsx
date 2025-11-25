import { Skeleton } from "@/components/ui/skeleton";

export function LoadingTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#27272a]">
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-3 w-20" />
            </th>
            <th className="px-4 py-3 text-left">
              <Skeleton className="h-3 w-32" />
            </th>
            <th className="px-4 py-3 text-right">
              <Skeleton className="h-3 w-16 ml-auto" />
            </th>
            <th className="px-4 py-3 text-right">
              <Skeleton className="h-3 w-16 ml-auto" />
            </th>
            <th className="px-4 py-3 text-center">
              <Skeleton className="h-3 w-20 mx-auto" />
            </th>
            <th className="px-4 py-3 text-center">
              <Skeleton className="h-3 w-16 mx-auto" />
            </th>
            <th className="px-4 py-3 text-center">
              <Skeleton className="h-3 w-12 mx-auto" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index} className="border-b border-[#27272a]">
              <td className="px-4 py-4">
                <Skeleton className="h-4 w-16" />
              </td>
              <td className="px-4 py-4">
                <Skeleton className="h-4 w-full max-w-md" />
              </td>
              <td className="px-4 py-4">
                <Skeleton className="h-4 w-20 ml-auto" />
              </td>
              <td className="px-4 py-4">
                <Skeleton className="h-4 w-16 ml-auto" />
              </td>
              <td className="px-4 py-4">
                <Skeleton className="h-4 w-24 mx-auto" />
              </td>
              <td className="px-4 py-4">
                <Skeleton className="h-4 w-16 mx-auto" />
              </td>
              <td className="px-4 py-4">
                <Skeleton className="h-8 w-16 mx-auto rounded-lg" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
