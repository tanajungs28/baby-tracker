import { Skeleton } from "@/components/ui/skeleton";

export default function DailyLoading() {
  return (
    <div className="flex flex-col h-full">
      {/* 日付ナビゲーションスケルトン */}
      <div className="border-b-2 border-[#FFD6E0] px-4 py-3 flex items-center justify-between">
        <Skeleton className="w-11 h-11 rounded-full" />
        <Skeleton className="w-36 h-6" />
        <Skeleton className="w-11 h-11 rounded-full" />
      </div>

      {/* マトリクスヘッダースケルトン */}
      <div className="px-2 pt-2">
        <div className="flex gap-1 mb-2">
          <Skeleton className="w-12 h-10" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="flex-1 h-10" />
          ))}
        </div>

        {/* 行スケルトン */}
        {Array.from({ length: 12 }).map((_, row) => (
          <div key={row} className="flex gap-1 mb-1">
            <Skeleton className="w-12 h-11" />
            {Array.from({ length: 5 }).map((_, col) => (
              <Skeleton key={col} className="flex-1 h-11" style={{ opacity: 1 - row * 0.05 }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
