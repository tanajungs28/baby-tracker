"use client";

import { useRef, useEffect } from "react";
import type { SleepRecord, SleepPerson } from "@/lib/types";

const SLOT_H = 36; // px per 30-min slot
const TOTAL_SLOTS = 48; // 24h × 2

const PEOPLE: { key: SleepPerson; label: string; emoji: string; color: string }[] = [
  { key: "papa", label: "パパ", emoji: "👨", color: "#A8D8EA" },
  { key: "mama", label: "ママ", emoji: "👩", color: "#FFB6C8" },
];

interface SleepTimelineProps {
  records: SleepRecord[];
  isToday: boolean;
  onToggle: (minute: number, person: SleepPerson, currentlyActive: boolean) => void;
}

export default function SleepTimeline({ records, isToday, onToggle }: SleepTimelineProps) {
  const dragging = useRef(false);
  const dragMode = useRef<"add" | "remove">("add");
  const lastKey = useRef<string | null>(null);
  const currentSlotRef = useRef<HTMLTableRowElement>(null);

  const now = new Date();
  const currentSlot = isToday
    ? Math.floor(now.getHours() * 2 + now.getMinutes() / 30)
    : -1;

  useEffect(() => {
    if (isToday && currentSlotRef.current) {
      currentSlotRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isToday]);

  useEffect(() => {
    const end = () => { dragging.current = false; lastKey.current = null; };
    window.addEventListener("pointerup", end);
    return () => window.removeEventListener("pointerup", end);
  }, []);

  function isActive(minute: number, person: SleepPerson) {
    return records.some((r) => r.recorded_minute === minute && r.person === person);
  }

  function startDrag(e: React.PointerEvent, minute: number, person: SleepPerson) {
    e.preventDefault();
    const active = isActive(minute, person);
    dragging.current = true;
    dragMode.current = active ? "remove" : "add";
    lastKey.current = `${minute}-${person}`;
    onToggle(minute, person, active);
  }

  function enterCell(minute: number, person: SleepPerson) {
    if (!dragging.current) return;
    const key = `${minute}-${person}`;
    if (lastKey.current === key) return;
    lastKey.current = key;
    const active = isActive(minute, person);
    if (dragMode.current === "add" && !active) onToggle(minute, person, false);
    else if (dragMode.current === "remove" && active) onToggle(minute, person, true);
  }

  const totals = {
    papa: records.filter((r) => r.person === "papa").length * 30,
    mama: records.filter((r) => r.person === "mama").length * 30,
  };

  function fmtDuration(m: number) {
    if (m === 0) return "−";
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return mm ? `${h}h${mm}m` : `${h}h`;
  }

  return (
    <table className="w-full border-collapse text-xs select-none">
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
                {fmtDuration(totals[p.key])}
              </span>
            </td>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: TOTAL_SLOTS }, (_, i) => {
          const minute = i * 30;
          const hour = Math.floor(minute / 60);
          const min = minute % 60;
          const isHourMark = min === 0;
          const isCurrent = i === currentSlot;

          return (
            <tr
              key={i}
              ref={isCurrent ? currentSlotRef : undefined}
              style={{ height: SLOT_H }}
              className={isCurrent ? "bg-[#FFD6E0]/30" : ""}
            >
              <td
                className={`text-center ${
                  isHourMark
                    ? "border-t border-[#FFD6E0] font-medium text-[10px] text-[#5C4A3D]/60"
                    : "text-[9px] text-[#5C4A3D]/30"
                }`}
                style={{ padding: 0, verticalAlign: "middle" }}
              >
                <span className="flex items-center justify-center gap-0.5">
                  {isCurrent && <span className="text-[#FF8FA3]">▶</span>}
                  {isHourMark
                    ? `${hour}:00`
                    : <span className="text-[#5C4A3D]/25">:30</span>
                  }
                </span>
              </td>

              {PEOPLE.map((p) => {
                const active = isActive(minute, p.key);
                const prevActive = i > 0 && isActive((i - 1) * 30, p.key);
                const nextActive = i < TOTAL_SLOTS - 1 && isActive((i + 1) * 30, p.key);
                const isTop = active && !prevActive;
                const isBottom = active && !nextActive;

                return (
                  <td
                    key={p.key}
                    style={{ padding: "0 6px", touchAction: "none" }}
                    className={isHourMark ? "border-t border-[#FFD6E0]/60" : ""}
                  >
                    <div
                      className="w-full transition-colors"
                      style={{
                        height: SLOT_H - (isHourMark ? 1 : 0),
                        backgroundColor: active ? `${p.color}85` : "transparent",
                        borderLeft: active ? `3px solid ${p.color}` : "3px solid transparent",
                        borderRight: active ? `2px solid ${p.color}` : "2px solid transparent",
                        borderTop: isTop ? `2px solid ${p.color}` : "none",
                        borderBottom: isBottom ? `2px solid ${p.color}` : "none",
                        borderTopLeftRadius: isTop ? 6 : 0,
                        borderTopRightRadius: isTop ? 6 : 0,
                        borderBottomLeftRadius: isBottom ? 6 : 0,
                        borderBottomRightRadius: isBottom ? 6 : 0,
                        cursor: "pointer",
                      }}
                      onPointerDown={(e) => startDrag(e, minute, p.key)}
                      onPointerEnter={() => enterCell(minute, p.key)}
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
