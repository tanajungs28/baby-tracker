"use client";

import { useState } from "react";
import { NOTE_MAX_LENGTH } from "@/lib/types";

interface NoteModalProps {
  hour: number;
  existing: string;
  onSave: (note: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export default function NoteModal({
  hour,
  existing,
  onSave,
  onClear,
  onClose,
}: NoteModalProps) {
  const [note, setNote] = useState(existing);

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
        aria-label="メモの入力"
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl bg-[#FFE4B5]">
              📝
            </div>
            <div>
              <p className="font-bold text-[#5C4A3D] text-lg">メモ</p>
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

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={NOTE_MAX_LENGTH}
          rows={4}
          autoFocus
          placeholder="体温、機嫌、気づいたことなど自由に"
          aria-label={`${hour}時のメモ`}
          className="w-full rounded-2xl border-2 border-[#FFD6E0] bg-white p-3 text-base text-[#5C4A3D] placeholder:text-[#5C4A3D]/30 focus:outline-none focus:border-[#FF8FA3] resize-none"
        />
        <p className="text-right text-[11px] text-[#5C4A3D]/40 mt-1">
          {note.length}/{NOTE_MAX_LENGTH}
        </p>

        {/* ボタン */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClear}
            aria-label="クリア"
            className="flex-1 py-4 rounded-2xl border-2 border-[#FFD6E0] text-[#5C4A3D]/60 font-medium active:scale-95 transition-transform"
          >
            クリア
          </button>
          <button
            onClick={() => onSave(note)}
            aria-label="保存"
            className="flex-1 py-4 rounded-2xl text-white font-bold active:scale-95 transition-transform"
            style={{ backgroundColor: "#FF8FA3" }}
          >
            保存 ✓
          </button>
        </div>
      </div>
    </div>
  );
}
