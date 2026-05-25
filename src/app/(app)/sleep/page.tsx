"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBaby } from "@/hooks/useBaby";
import { useSleep, useSleepSummary } from "@/hooks/useSleep";
import { type PeriodType } from "@/hooks/useSummary";
import SleepTimeline from "@/components/sleep/SleepTimeline";
import SleepCharts from "@/components/sleep/SleepCharts";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(date: Date): string {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addPeriod(anchor: Date, period: PeriodType, delta: number): Date {
  const d = new Date(anchor);
  if (period === "day") d.setDate(d.getDate() + delta * 7);
  else if (period === "week") d.setDate(d.getDate() + delta * 6 * 7);
  else d.setMonth(d.getMonth() + delta * 3);
  return d;
}

export default function SleepPage() {
  const [view, setView] = useState<"record" | "graph">("record");
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [period, setPeriod] = useState<PeriodType>("day");
  const [anchor, setAnchor] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const today = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  const isToday = isSameDay(selectedDate, today);
  const isLatest = anchor.getTime() >= today.getTime();

  const { baby } = useBaby();
  const { sleepRecords, toggleSleep } = useSleep(baby?.id, selectedDate);
  const { sleepSummary, dateRange } = useSleepSummary(baby?.id, anchor, period);

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-[#FFF9F2] border-b-2 border-[#FFD6E0] px-4 pt-3 pb-2">
        {/* きろく / グラフ 切り替え */}
        <div className="flex rounded-2xl bg-[#FFD6E0]/40 p-1 mb-2">
          <button
            onClick={() => setView("record")}
            className={`flex-1 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              view === "record" ? "bg-[#FF8FA3] text-white" : "text-[#5C4A3D]/60"
            }`}
          >
            きろく
          </button>
          <button
            onClick={() => setView("graph")}
            className={`flex-1 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              view === "graph" ? "bg-[#FF8FA3] text-white" : "text-[#5C4A3D]/60"
            }`}
          >
            グラフ
          </button>
        </div>

        {/* きろく: 日付ナビ */}
        {view === "record" && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedDate((d) => addDays(d, -1))}
              aria-label="前の日"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FFD6E0]/50 text-[#5C4A3D] active:scale-90 transition-transform"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center">
              <span className="text-sm font-bold text-[#5C4A3D]">{formatDate(selectedDate)}</span>
              {isToday && (
                <span className="ml-2 text-xs bg-[#FF8FA3] text-white rounded-full px-2 py-0.5">
                  今日
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {!isToday && (
                <button
                  onClick={() => setSelectedDate(today)}
                  aria-label="今日に戻る"
                  className="text-xs bg-[#FF8FA3] text-white rounded-full px-3 py-1.5 active:scale-90 transition-transform"
                >
                  今日
                </button>
              )}
              <button
                onClick={() => setSelectedDate((d) => addDays(d, 1))}
                aria-label="次の日"
                disabled={isToday}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FFD6E0]/50 text-[#5C4A3D] active:scale-90 transition-transform disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* グラフ: 期間タブ + ナビ */}
        {view === "graph" && (
          <>
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
            <div className="flex items-center justify-between mt-2">
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
          </>
        )}
      </div>

      {/* コンテンツ */}
      {view === "record" ? (
        <div className="flex-1 overflow-auto overscroll-none">
          <SleepTimeline
            records={sleepRecords}
            isToday={isToday}
            onToggle={toggleSleep}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          {sleepSummary ? (
            <SleepCharts summary={sleepSummary} period={period} />
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
      )}
    </div>
  );
}
