"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBaby } from "@/hooks/useBaby";
import { useSummary, type PeriodType } from "@/hooks/useSummary";
import SummaryCharts from "@/components/summary/SummaryCharts";
import { Skeleton } from "@/components/ui/skeleton";

function addPeriod(anchor: Date, period: PeriodType, delta: number): Date {
  const d = new Date(anchor);
  if (period === "day") d.setDate(d.getDate() + delta * 7);
  else if (period === "week") d.setDate(d.getDate() + delta * 6 * 7);
  else d.setMonth(d.getMonth() + delta * 3);
  return d;
}

export default function SummaryPage() {
  const [period, setPeriod] = useState<PeriodType>("day");
  const [anchor, setAnchor] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const { baby } = useBaby();
  const { summary, dateRange } = useSummary(baby?.id, anchor, period);

  const today = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  const isLatest = anchor.getTime() >= today.getTime();

  return (
    <div className="flex flex-col min-h-full">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-[#FFF9F2] border-b-2 border-[#FFD6E0] px-4 pt-4 pb-2">
        <Tabs value={period} onValueChange={(v) => setPeriod(v as PeriodType)}>
          <TabsList className="grid grid-cols-3 w-full bg-[#FFD6E0]/40 rounded-2xl">
            <TabsTrigger value="day" className="rounded-xl data-[state=active]:bg-[#FF8FA3] data-[state=active]:text-white">
              日
            </TabsTrigger>
            <TabsTrigger value="week" className="rounded-xl data-[state=active]:bg-[#FF8FA3] data-[state=active]:text-white">
              週
            </TabsTrigger>
            <TabsTrigger value="month" className="rounded-xl data-[state=active]:bg-[#FF8FA3] data-[state=active]:text-white">
              月
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 期間ナビゲーション */}
        <div className="flex items-center justify-between mt-2 py-1">
          <button
            onClick={() => setAnchor((a) => addPeriod(a, period, -1))}
            aria-label="前の期間"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FFD6E0]/50 text-[#5C4A3D] active:scale-90 transition-transform"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs text-[#5C4A3D]/60">
            {dateRange.start} 〜 {dateRange.end}
          </span>
          <button
            onClick={() => setAnchor((a) => addPeriod(a, period, 1))}
            aria-label="次の期間"
            disabled={isLatest}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FFD6E0]/50 text-[#5C4A3D] active:scale-90 transition-transform disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* グラフエリア */}
      <div className="flex-1">
        {summary ? (
          <SummaryCharts summary={summary} />
        ) : (
          <div className="px-4 py-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border-2 border-[#FFD6E0]">
                <Skeleton className="w-32 h-4 mb-3" />
                <Skeleton className="w-full h-40 rounded-xl" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
