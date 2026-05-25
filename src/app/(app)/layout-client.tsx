"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import type { Baby } from "@/lib/types";
import BabySetupModal from "@/components/BabySetupModal";
import { Toaster } from "@/components/ui/sonner";

interface AppLayoutClientProps {
  children: React.ReactNode;
  user: User;
  initialBaby: Baby | null;
}

const NAV_ITEMS = [
  { href: "/daily", label: "きろく", emoji: "📝" },
  { href: "/summary", label: "グラフ", emoji: "📊" },
  { href: "/sleep", label: "すいみん", emoji: "😴" },
  { href: "/settings", label: "せってい", emoji: "⚙️" },
];

export default function AppLayoutClient({
  children,
  user,
  initialBaby,
}: AppLayoutClientProps) {
  const pathname = usePathname();
  const [baby, setBaby] = useState<Baby | null>(initialBaby);

  return (
    <>
      <main className="flex-1 pb-20 overflow-hidden h-full">{children}</main>

      {/* 下部タブバー */}
      <nav
        aria-label="メインナビゲーション"
        className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#FFD6E0] safe-area-pb"
      >
        <div className="flex">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`flex-1 flex flex-col items-center justify-center py-3 min-h-[56px] transition-colors ${
                  isActive
                    ? "text-[#FF8FA3]"
                    : "text-[#5C4A3D]/40"
                }`}
              >
                <span className="text-2xl leading-none">{item.emoji}</span>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <Toaster position="top-center" />

      {/* 初回ログイン時の赤ちゃん登録モーダル */}
      {!baby && (
        <BabySetupModal
          userId={user.id}
          onComplete={(newBaby) => setBaby(newBaby)}
        />
      )}
    </>
  );
}
