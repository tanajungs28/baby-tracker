import { Skeleton } from "@/components/ui/skeleton";

export default function SummaryLoading() {
  return (
    <div className="flex flex-col">
      {/* タブスケルトン */}
      <div className="border-b-2 border-[#FFD6E0] px-4 pt-4 pb-3">
        <Skeleton className="w-full h-10 rounded-2xl" />
        <div className="flex items-center justify-between mt-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-40 h-4" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>

      {/* グラフスケルトン */}
      <div className="px-4 py-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 border-2 border-[#FFD6E0]">
            <Skeleton className="w-32 h-4 mb-3" />
            <Skeleton className="w-full h-40 rounded-xl" />
          </div>
        ))}

        {/* 合計カードスケルトン */}
        <div className="bg-white rounded-2xl p-4 border-2 border-[#FFD6E0]">
          <Skeleton className="w-24 h-4 mb-3" />
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
