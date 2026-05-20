"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Baby } from "@/lib/types";

interface BabySetupModalProps {
  userId: string;
  onComplete: (baby: Baby) => void;
}

type Mode = "select" | "create" | "join";

export default function BabySetupModal({ userId, onComplete }: BabySetupModalProps) {
  const [mode, setMode] = useState<Mode>("select");
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim() || !birthDate) return;
    setIsLoading(true);
    setError(null);
    const supabase = createClient();
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

  async function handleJoin() {
    if (!inviteCode.trim()) return;
    setIsLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("join_baby_by_code", {
      p_invite_code: inviteCode.trim(),
    });

    if (error || !data) {
      setIsLoading(false);
      setError("コードが正しくありません。確認してもう一度試してください。");
      return;
    }

    const { data: baby, error: babyError } = await supabase
      .from("babies")
      .select("*")
      .eq("id", (data as { baby_id: string }).baby_id)
      .single();

    setIsLoading(false);
    if (babyError || !baby) {
      setError("参加に失敗しました。もう一度お試しください。");
    } else {
      onComplete(baby as Baby);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
      <div className="bg-[#FFF9F2] rounded-t-3xl w-full max-w-lg p-6 pb-10">

        {/* モード選択 */}
        {mode === "select" && (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-2">👶</div>
              <h2 className="text-xl font-bold text-[#5C4A3D]">はじめましょう</h2>
              <p className="text-[#5C4A3D]/60 text-sm mt-1">赤ちゃんの記録を始めるには</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setMode("create")}
                aria-label="新しく赤ちゃんを登録する"
                className="w-full bg-[#FF8FA3] text-white rounded-2xl py-4 text-base font-bold active:scale-95 transition-transform"
              >
                新しく登録する 🌸
              </button>
              <button
                onClick={() => setMode("join")}
                aria-label="招待コードで参加する"
                className="w-full bg-white border-2 border-[#FFD6E0] text-[#5C4A3D] rounded-2xl py-4 text-base font-medium active:scale-95 transition-transform"
              >
                招待コードで参加する 🔑
              </button>
            </div>
          </>
        )}

        {/* 新規登録 */}
        {mode === "create" && (
          <>
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => { setMode("select"); setError(null); }}
                aria-label="戻る"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FFD6E0]/50 text-[#5C4A3D] text-lg"
              >
                ←
              </button>
              <h2 className="text-xl font-bold text-[#5C4A3D]">赤ちゃんを登録</h2>
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
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                onClick={handleCreate}
                disabled={isLoading || !name.trim() || !birthDate}
                aria-label="登録する"
                className="w-full bg-[#FF8FA3] text-white rounded-2xl py-4 text-base font-bold active:scale-95 transition-transform disabled:opacity-50"
              >
                {isLoading ? "登録中..." : "登録する 🌸"}
              </button>
            </div>
          </>
        )}

        {/* コードで参加 */}
        {mode === "join" && (
          <>
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => { setMode("select"); setError(null); }}
                aria-label="戻る"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-[#FFD6E0]/50 text-[#5C4A3D] text-lg"
              >
                ←
              </button>
              <h2 className="text-xl font-bold text-[#5C4A3D]">コードで参加</h2>
            </div>
            <p className="text-[#5C4A3D]/60 text-sm mb-4">
              パートナーの設定画面に表示されている6文字の招待コードを入力してください。
            </p>
            <div className="space-y-4">
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="例: AB12CD"
                maxLength={6}
                aria-label="招待コード"
                className="w-full bg-white border-2 border-[#FFD6E0] rounded-2xl py-4 px-4 text-[#5C4A3D] placeholder-[#5C4A3D]/30 text-xl font-bold tracking-widest text-center focus:outline-none focus:border-[#FF8FA3]"
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button
                onClick={handleJoin}
                disabled={isLoading || inviteCode.length < 6}
                aria-label="参加する"
                className="w-full bg-[#FF8FA3] text-white rounded-2xl py-4 text-base font-bold active:scale-95 transition-transform disabled:opacity-50"
              >
                {isLoading ? "確認中..." : "参加する 🔑"}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
