"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBaby } from "@/hooks/useBaby";
import { useSleep, useSleepSummary } from "@/hooks/useSleep";
import SleepMatrix from "@/components/sleep/SleepMatrix";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

export default function SleepPage() {
  const [view, setView] = useState<"record" | "graph">("record");
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
  const { sleepRecords, toggleSleep } = useSleep(baby?.id, selectedDate);
  const { chartData } = useSleepSummary(baby?.id);

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

        {/* 日付ナビ（きろくのみ） */}
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
      </div>

      {/* コンテンツ */}
      {view === "record" ? (
        <div className="flex-1 overflow-auto overscroll-none">
          <SleepMatrix
            records={sleepRecords}
            isToday={isToday}
            onToggle={toggleSleep}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-auto px-4 py-4 space-y-4">
          <p className="text-xs text-[#5C4A3D]/50 text-center">直近7日間の睡眠時間</p>

          {chartData.length > 0 && chartData.some((d) => d.papa > 0 || d.mama > 0) ? (
            <div className="bg-white rounded-2xl p-4 border-2 border-[#FFD6E0]">
              <p className="text-xs font-medium text-[#5C4A3D] mb-3">😴 睡眠時間（時間）</p>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#FFD6E0" />
                  <XAxis dataKey="label" tick={{ fill: "#5C4A3D", fontSize: 10 }} />
                  <YAxis
                    tick={{ fill: "#5C4A3D", fontSize: 10 }}
                    allowDecimals={false}
                    domain={[0, 12]}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, fontSize: 12 }}
                    formatter={(v) => [`${v}時間`, undefined]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="papa"
                    name="👨 パパ"
                    stroke="#A8D8EA"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#A8D8EA" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="mama"
                    name="👩 ママ"
                    stroke="#FFB6C8"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#FFB6C8" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-[#5C4A3D]/40">
              <p className="text-4xl mb-3">😴</p>
              <p className="text-sm">まだデータがありません</p>
              <p className="text-xs mt-1">きろくタブから睡眠を記録してください</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
