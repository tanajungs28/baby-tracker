"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBaby } from "@/hooks/useBaby";
import { useRecords } from "@/hooks/useRecords";
import RecordMatrix from "@/components/daily/RecordMatrix";
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

export default function DailyPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
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
  const { baby } = useBaby();
  const { records, upsertRecord, deleteRecord } = useRecords(baby?.id, selectedDate);

  return (
    <div className="flex flex-col h-full">
      {/* 日付ナビゲーション */}
      <div className="sticky top-0 z-10 bg-[#FFF9F2] border-b-2 border-[#FFD6E0] px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSelectedDate((d) => addDays(d, -1))}
          aria-label="前の日"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-[#FFD6E0]/50 text-[#5C4A3D] active:scale-90 transition-transform"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="text-center">
          <span className="text-base font-bold text-[#5C4A3D]">
            {formatDate(selectedDate)}
          </span>
          {isToday && (
            <span className="ml-2 text-xs bg-[#FF8FA3] text-white rounded-full px-2 py-0.5">
              今日
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
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
            className="w-11 h-11 flex items-center justify-center rounded-full bg-[#FFD6E0]/50 text-[#5C4A3D] active:scale-90 transition-transform disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* マトリクス */}
      <div className="flex-1 overflow-auto">
        {baby ? (
          <RecordMatrix
            records={records}
            date={selectedDate}
            isToday={isToday}
            onUpsert={upsertRecord}
            onDelete={deleteRecord}
          />
        ) : (
          <div className="px-2 pt-2 space-y-1">
            <div className="flex gap-1 mb-2">
              <Skeleton className="w-12 h-10" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="flex-1 h-10" />
              ))}
            </div>
            {Array.from({ length: 10 }).map((_, row) => (
              <div key={row} className="flex gap-1">
                <Skeleton className="w-12 h-11" />
                {Array.from({ length: 5 }).map((_, col) => (
                  <Skeleton key={col} className="flex-1 h-11" />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
