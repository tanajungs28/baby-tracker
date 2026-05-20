"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useBaby } from "@/hooks/useBaby";

export default function SettingsPage() {
  const router = useRouter();
  const { baby } = useBaby();
  const supabase = createClient();
  const [confirmLogout, setConfirmLogout] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (baby === undefined) {
    return (
      <div className="px-4 py-6">
        <div className="h-6 w-24 bg-[#FFD6E0]/60 rounded animate-pulse mb-4" />
        <div className="h-24 bg-[#FFD6E0]/40 rounded-2xl animate-pulse mb-3" />
        <div className="h-14 bg-[#FFD6E0]/40 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-4 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-[#5C4A3D]">せってい</h1>

      {/* 赤ちゃん情報カード */}
      {baby && (
        <div className="bg-white rounded-2xl p-5 border-2 border-[#FFD6E0]">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#FFD6E0] flex items-center justify-center text-2xl flex-shrink-0">
              👶
            </div>
            <div>
              <p className="text-lg font-bold text-[#5C4A3D]">{baby.name}</p>
              <p className="text-sm text-[#5C4A3D]/60">
                生年月日: {baby.birth_date}
              </p>
              <p className="text-sm text-[#5C4A3D]/60">
                生後: {getDaysOld(baby.birth_date)}日目
              </p>
            </div>
          </div>
        </div>
      )}

      {/* アプリ情報 */}
      <div className="bg-white rounded-2xl p-4 border-2 border-[#FFD6E0]">
        <p className="text-xs text-[#5C4A3D]/50 mb-1">アプリ</p>
        <div className="flex items-center justify-between">
          <span className="font-medium text-[#5C4A3D]">BabyLog</span>
          <span className="text-xs text-[#5C4A3D]/40">v1.0.0</span>
        </div>
        <p className="text-xs text-[#5C4A3D]/50 mt-1">
          新生児の育児記録アプリ 🌸
        </p>
      </div>

      {/* ログアウト */}
      {confirmLogout ? (
        <div className="bg-[#FFD6E0]/40 rounded-2xl p-4 border-2 border-[#FF8FA3]/40">
          <p className="text-center text-[#5C4A3D] font-medium mb-3">
            ログアウトしますか？
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmLogout(false)}
              aria-label="キャンセル"
              className="flex-1 py-3 rounded-2xl border-2 border-[#FFD6E0] text-[#5C4A3D]/70 font-medium active:scale-95 transition-transform"
            >
              キャンセル
            </button>
            <button
              onClick={handleLogout}
              aria-label="ログアウトを確認"
              className="flex-1 py-3 rounded-2xl bg-[#FF8FA3] text-white font-bold active:scale-95 transition-transform"
            >
              ログアウト
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirmLogout(true)}
          aria-label="ログアウト"
          className="w-full py-4 rounded-2xl border-2 border-[#FFD6E0] text-[#5C4A3D]/70 font-medium active:scale-95 transition-transform"
        >
          ログアウト
        </button>
      )}
    </div>
  );
}

function getDaysOld(birthDate: string): number {
  const birth = new Date(birthDate + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}
