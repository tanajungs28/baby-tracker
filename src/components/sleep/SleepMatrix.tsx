"use client";

import { useRef, useEffect } from "react";
import type { SleepRecord, SleepPerson } from "@/lib/types";

const PEOPLE: { key: SleepPerson; label: string; emoji: string; color: string }[] = [
  { key: "papa", label: "パパ", emoji: "👨", color: "#A8D8EA" },
  { key: "mama", label: "ママ", emoji: "👩", color: "#FFB6C8" },
];

interface SleepMatrixProps {
  records: SleepRecord[];
  isToday: boolean;
  onToggle: (hour: number, person: SleepPerson, currentlyActive: boolean) => void;
}

export default function SleepMatrix({ records, isToday, onToggle }: SleepMatrixProps) {
  const dragging = useRef(false);
  const dragMode = useRef<"add" | "remove">("add");
  const lastCell = useRef<string | null>(null);
  const currentHour = new Date().getHours();
  const currentRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (isToday && currentRowRef.current) {
      currentRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isToday]);

  function isActive(hour: number, person: SleepPerson): boolean {
    return records.some((r) => r.recorded_hour === hour && r.person === person);
  }

  // マウスドラッグ専用（タッチはonClickで操作）
  function handleMouseDown(e: React.MouseEvent<HTMLDivElement>, hour: number, person: SleepPerson) {
    e.preventDefault();
    dragging.current = true;
    const active = isActive(hour, person);
    dragMode.current = active ? "remove" : "add";
    lastCell.current = `${hour}-${person}`;
    onToggle(hour, person, active);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLTableElement>) {
    if (!dragging.current) return;
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const cell = el?.closest("[data-hour][data-person]") as HTMLElement | null;
    if (!cell) return;
    const hour = parseInt(cell.dataset.hour!);
    const person = cell.dataset.person as SleepPerson;
    const cellKey = `${hour}-${person}`;
    if (lastCell.current === cellKey) return;
    lastCell.current = cellKey;
    const active = isActive(hour, person);
    if (dragMode.current === "add" && !active) onToggle(hour, person, false);
    else if (dragMode.current === "remove" && active) onToggle(hour, person, true);
  }

  function handleMouseUp() {
    dragging.current = false;
    lastCell.current = null;
  }

  // タッチ（モバイル）はシンプルなタップトグル
  function handleClick(hour: number, person: SleepPerson) {
    if (dragging.current) return;
    onToggle(hour, person, isActive(hour, person));
  }

  const totals = {
    papa: records.filter((r) => r.person === "papa").length,
    mama: records.filter((r) => r.person === "mama").length,
  };

  function formatHours(count: number): string {
    if (count === 0) return "−";
    const h = Math.floor(count);
    const m = Math.round((count - h) * 60);
    return m === 0 ? `${h}h` : `${h}h${m}m`;
  }

  return (
    <table
      className="w-full border-collapse text-xs select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <thead className="sticky top-0 z-10 bg-[#FFF9F2]">
        <tr>
          <th className="w-14 py-2 text-center text-[#5C4A3D]/40 font-normal text-xs border-b border-[#FFD6E0]">
            時間
          </th>
          {PEOPLE.map((p) => (
            <th key={p.key} className="py-2 text-center font-medium text-[#5C4A3D] border-b border-[#FFD6E0]">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-base">{p.emoji}</span>
                <span className="text-[10px]">{p.label}</span>
              </div>
            </th>
          ))}
        </tr>
        <tr className="bg-[#FFF9F2]">
          <td className="py-1 text-center text-[#5C4A3D]/40 text-[10px] border-b-2 border-[#FFD6E0]">
            合計
          </td>
          {PEOPLE.map((p) => (
            <td key={p.key} className="py-1 text-center border-b-2 border-[#FFD6E0]">
              <span
                className="text-[11px] font-bold px-1.5 py-0.5 rounded-lg"
                style={{
                  backgroundColor: totals[p.key] > 0 ? `${p.color}90` : "transparent",
                  color: totals[p.key] > 0 ? "#5C4A3D" : "#5C4A3D40",
                }}
              >
                {formatHours(totals[p.key])}
              </span>
            </td>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 24 }, (_, hour) => {
          const isCurrentHour = isToday && hour === currentHour;
          return (
            <tr
              key={hour}
              ref={isCurrentHour ? currentRowRef : undefined}
              className={isCurrentHour ? "bg-[#FFD6E0]/30" : ""}
            >
              <td className="py-1.5 text-center text-[#5C4A3D]/50 border-b border-[#FFD6E0]/40 text-xs">
                <div className="flex items-center justify-center gap-0.5">
                  {isCurrentHour && <span className="text-[#FF8FA3] text-[10px]">▶</span>}
                  {`${hour}:00`}
                </div>
              </td>
              {PEOPLE.map((p) => {
                const active = isActive(hour, p.key);
                return (
                  <td key={p.key} className="py-0.5 px-2 border-b border-[#FFD6E0]/40">
                    <div
                      data-hour={hour}
                      data-person={p.key}
                      role="button"
                      aria-label={`${hour}時 ${p.label} ${active ? "ON" : "OFF"}`}
                      aria-pressed={active}
                      className="w-full min-h-[44px] rounded-xl transition-colors cursor-pointer active:opacity-70"
                      style={{
                        backgroundColor: active ? `${p.color}90` : "#F0F0F0",
                        border: active ? `2px solid ${p.color}` : "2px solid transparent",
                      }}
                      onMouseDown={(e) => handleMouseDown(e, hour, p.key)}
                      onClick={() => handleClick(hour, p.key)}
                    />
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
