"use client";

import { useRef, useEffect, useState } from "react";
import type { BabyRecord, RecordType } from "@/lib/types";
import {
  RECORD_TYPES,
  RECORD_TYPE_LABELS,
  RECORD_TYPE_COLORS,
  RECORD_TYPE_EMOJIS,
} from "@/lib/types";
import InputModal from "./InputModal";

interface RecordMatrixProps {
  records: BabyRecord[];
  date: Date;
  isToday: boolean;
  onUpsert: (
    hour: number,
    type: RecordType,
    count: number | null,
    amount_ml: number | null
  ) => void;
  onDelete: (hour: number, type: RecordType) => void;
}

function getCellValue(record: BabyRecord | undefined, type: RecordType): string {
  if (!record) return "";
  if (type === "pumping" || type === "formula") {
    return record.amount_ml ? `${record.amount_ml}ml` : "";
  }
  if (record.count && record.count > 0) {
    return "●".repeat(Math.min(record.count, 5));
  }
  return "";
}

export default function RecordMatrix({
  records,
  date,
  isToday,
  onUpsert,
  onDelete,
}: RecordMatrixProps) {
  const currentHour = new Date().getHours();
  const [modal, setModal] = useState<{ hour: number; type: RecordType } | null>(null);
  const currentRowRef = useRef<HTMLTableRowElement>(null);

  useEffect(() => {
    if (isToday && currentRowRef.current) {
      currentRowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [isToday]);

  function getRecord(hour: number, type: RecordType): BabyRecord | undefined {
    return records.find((r) => r.recorded_hour === hour && r.type === type);
  }

  function handleCellTap(hour: number, type: RecordType) {
    setModal({ hour, type });
  }

  function handleSave(count: number | null, amount_ml: number | null) {
    if (!modal) return;
    onUpsert(modal.hour, modal.type, count, amount_ml);
    setModal(null);
  }

  function handleClear() {
    if (!modal) return;
    onDelete(modal.hour, modal.type);
    setModal(null);
  }

  const modalRecord = modal
    ? getRecord(modal.hour, modal.type)
    : undefined;

  return (
    <>
      <div className="overflow-auto">
        <table className="w-full border-collapse text-xs" style={{ minWidth: "340px" }}>
          <thead className="sticky top-0 z-10 bg-[#FFF9F2]">
            <tr>
              <th className="w-12 py-2 text-center text-[#5C4A3D]/40 font-normal text-xs border-b border-[#FFD6E0]">
                時間
              </th>
              {RECORD_TYPES.map((type) => (
                <th
                  key={type}
                  className="py-2 text-center font-medium text-[#5C4A3D] border-b border-[#FFD6E0]"
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-base">{RECORD_TYPE_EMOJIS[type]}</span>
                    <span className="text-[10px]">{RECORD_TYPE_LABELS[type]}</span>
                  </div>
                </th>
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
                  className={isCurrentHour ? "bg-[#FFD6E0]/40" : ""}
                >
                  <td className="py-1.5 text-center text-[#5C4A3D]/50 border-b border-[#FFD6E0]/40 text-xs">
                    <div className="flex items-center justify-center gap-0.5">
                      {isCurrentHour && (
                        <span className="text-[#FF8FA3] text-[10px]">▶</span>
                      )}
                      {`${hour}:00`}
                    </div>
                  </td>
                  {RECORD_TYPES.map((type) => {
                    const record = getRecord(hour, type);
                    const value = getCellValue(record, type);
                    const color = RECORD_TYPE_COLORS[type];

                    return (
                      <td
                        key={type}
                        className="py-1 px-0.5 text-center border-b border-[#FFD6E0]/40"
                      >
                        <button
                          onClick={() => handleCellTap(hour, type)}
                          aria-label={`${hour}時 ${RECORD_TYPE_LABELS[type]}を記録`}
                          className="w-full min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center active:scale-90 transition-transform"
                          style={{
                            backgroundColor: value ? `${color}60` : "transparent",
                          }}
                        >
                          {value ? (
                            <span
                              className="text-[10px] font-semibold leading-tight text-center"
                              style={{ color: "#5C4A3D" }}
                            >
                              {value}
                            </span>
                          ) : (
                            <span className="text-[#5C4A3D]/15 text-xs">·</span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <InputModal
          hour={modal.hour}
          type={modal.type}
          existing={modalRecord}
          onSave={handleSave}
          onClear={handleClear}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
