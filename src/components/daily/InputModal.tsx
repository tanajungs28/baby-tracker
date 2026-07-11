"use client";

import { useState, useEffect } from "react";
import type { BabyRecord, RecordType } from "@/lib/types";
import { RECORD_TYPE_LABELS, RECORD_TYPE_COLORS, RECORD_TYPE_EMOJIS } from "@/lib/types";

interface InputModalProps {
  hour: number;
  type: RecordType;
  existing: BabyRecord | undefined;
  onSave: (count: number | null, amount_ml: number | null) => void;
  onClear: () => void;
  onClose: () => void;
}

const ML_OPTIONS = Array.from({ length: 40 }, (_, i) => (i + 1) * 5);

export default function InputModal({
  hour,
  type,
  existing,
  onSave,
  onClear,
  onClose,
}: InputModalProps) {
  const [count, setCount] = useState<number>(existing?.count ?? 0);
  const [amountMl, setAmountMl] = useState<number>(existing?.amount_ml ?? 0);

  const isBreastfeeding = type === "breastfeeding";
  const isAmountType = type === "pumping" || type === "formula";
  const color = RECORD_TYPE_COLORS[type];
  const label = RECORD_TYPE_LABELS[type];
  const emoji = RECORD_TYPE_EMOJIS[type];

  function handleSave() {
    if (isBreastfeeding) {
      onSave(count || null, amountMl || null);
    } else if (isAmountType) {
      onSave(null, amountMl || null);
    } else {
      onSave(count || null, null);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-end justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-[#FFF9F2] rounded-t-3xl w-full max-w-lg p-6 pb-10 animate-in slide-in-from-bottom"
        role="dialog"
        aria-modal="true"
        aria-label={`${label}の入力`}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
              style={{ backgroundColor: color }}
            >
              {emoji}
            </div>
            <div>
              <p className="font-bold text-[#5C4A3D] text-lg">{label}</p>
              <p className="text-[#5C4A3D]/60 text-sm">{hour}:00 〜 {hour}:59</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#FFD6E0]/50 text-[#5C4A3D] text-xl"
          >
            ×
          </button>
        </div>

        {/* 入力エリア */}
        {isBreastfeeding ? (
          <div className="space-y-6">
            <section>
              <p className="text-[#5C4A3D]/60 text-sm font-medium mb-3 text-center">
                回数
              </p>
              <CountInput value={count} onChange={setCount} color={color} />
            </section>
            <section>
              <p className="text-[#5C4A3D]/60 text-sm font-medium mb-3 text-center">
                飲んだ量
              </p>
              <AmountInput value={amountMl} onChange={setAmountMl} color={color} />
            </section>
          </div>
        ) : isAmountType ? (
          <AmountInput value={amountMl} onChange={setAmountMl} color={color} />
        ) : (
          <CountInput value={count} onChange={setCount} color={color} />
        )}

        {/* ボタン */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClear}
            aria-label="クリア"
            className="flex-1 py-4 rounded-2xl border-2 border-[#FFD6E0] text-[#5C4A3D]/60 font-medium active:scale-95 transition-transform"
          >
            クリア
          </button>
          <button
            onClick={handleSave}
            aria-label="保存"
            className="flex-2 flex-1 py-4 rounded-2xl text-white font-bold active:scale-95 transition-transform"
            style={{ backgroundColor: "#FF8FA3" }}
          >
            保存 ✓
          </button>
        </div>
      </div>
    </div>
  );
}

function CountInput({
  value,
  onChange,
  color,
}: {
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div className="flex items-center justify-center gap-6">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        aria-label="減らす"
        className="w-16 h-16 rounded-full text-3xl font-bold text-white active:scale-90 transition-transform flex items-center justify-center"
        style={{ backgroundColor: color }}
      >
        −
      </button>
      <div className="text-center min-w-[80px]">
        <span className="text-5xl font-bold text-[#5C4A3D] font-['Nunito']">
          {value}
        </span>
        <p className="text-[#5C4A3D]/60 text-sm mt-1">回</p>
      </div>
      <button
        onClick={() => onChange(value + 1)}
        aria-label="増やす"
        className="w-16 h-16 rounded-full text-3xl font-bold text-white active:scale-90 transition-transform flex items-center justify-center"
        style={{ backgroundColor: color }}
      >
        ＋
      </button>
    </div>
  );
}

function AmountInput({
  value,
  onChange,
  color,
}: {
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  const idx = ML_OPTIONS.indexOf(value);
  const selectedIdx = idx >= 0 ? idx : -1;

  return (
    <div>
      <div className="text-center mb-4">
        <span className="text-5xl font-bold text-[#5C4A3D] font-['Nunito']">
          {value || "−"}
        </span>
        <span className="text-lg text-[#5C4A3D]/60 ml-1">ml</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 snap-x scrollbar-hide">
        {ML_OPTIONS.map((ml) => (
          <button
            key={ml}
            onClick={() => onChange(ml)}
            aria-label={`${ml}ml`}
            aria-pressed={value === ml}
            className="snap-center flex-shrink-0 w-14 h-14 rounded-2xl font-semibold text-sm active:scale-90 transition-transform"
            style={{
              backgroundColor: value === ml ? color : "#fff",
              color: value === ml ? "#fff" : "#5C4A3D",
              border: `2px solid ${value === ml ? color : "#FFD6E0"}`,
            }}
          >
            {ml}
          </button>
        ))}
      </div>
    </div>
  );
}
