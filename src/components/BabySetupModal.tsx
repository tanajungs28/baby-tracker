"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Baby } from "@/lib/types";

interface BabySetupModalProps {
  userId: string;
  onComplete: (baby: Baby) => void;
}

export default function BabySetupModal({ userId, onComplete }: BabySetupModalProps) {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  async function handleSubmit() {
    if (!name.trim() || !birthDate) return;
    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("babies")
      .insert({ user_id: userId, name: name.trim(), birth_date: birthDate })
      .select()
      .single();

    setIsLoading(false);
    if (error || !data) {
      setError("登録に失敗しました。もう一度お試しください。");
    } else {
      onComplete(data as Baby);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
      <div className="bg-[#FFF9F2] rounded-t-3xl w-full max-w-lg p-6 pb-10">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">👶</div>
          <h2 className="text-xl font-bold text-[#5C4A3D]">赤ちゃんを登録しよう</h2>
          <p className="text-[#5C4A3D]/60 text-sm mt-1">最初に赤ちゃんの情報を教えてください</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="baby-name" className="block text-sm font-medium text-[#5C4A3D] mb-1">
              赤ちゃんの名前
            </label>
            <input
              id="baby-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: はなちゃん"
              aria-label="赤ちゃんの名前"
              className="w-full bg-white border-2 border-[#FFD6E0] rounded-2xl py-4 px-4 text-[#5C4A3D] placeholder-[#5C4A3D]/30 text-base focus:outline-none focus:border-[#FF8FA3]"
            />
          </div>

          <div>
            <label htmlFor="birth-date" className="block text-sm font-medium text-[#5C4A3D] mb-1">
              生年月日
            </label>
            <input
              id="birth-date"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              aria-label="生年月日"
              max={new Date().toISOString().split("T")[0]}
              className="w-full bg-white border-2 border-[#FFD6E0] rounded-2xl py-4 px-4 text-[#5C4A3D] text-base focus:outline-none focus:border-[#FF8FA3]"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={isLoading || !name.trim() || !birthDate}
            aria-label="赤ちゃんを登録する"
            className="w-full bg-[#FF8FA3] text-white rounded-2xl py-4 text-base font-bold active:scale-95 transition-transform disabled:opacity-50 mt-2"
          >
            {isLoading ? "登録中..." : "登録する 🌸"}
          </button>
        </div>
      </div>
    </div>
  );
}
