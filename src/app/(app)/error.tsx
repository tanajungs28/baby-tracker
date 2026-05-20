"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-[#FFF9F2]">
      <div className="text-6xl mb-4">😢</div>
      <h2 className="text-xl font-bold text-[#5C4A3D] mb-2">
        あれ、なにかへんだよ
      </h2>
      <p className="text-[#5C4A3D]/60 text-sm mb-8 max-w-xs">
        データを読み込めませんでした。
        <br />
        もう一度試してみてね。
      </p>
      <button
        onClick={reset}
        aria-label="もう一度試す"
        className="bg-[#FF8FA3] text-white rounded-2xl px-8 py-4 font-bold active:scale-95 transition-transform"
      >
        もう一度試す
      </button>
    </div>
  );
}
