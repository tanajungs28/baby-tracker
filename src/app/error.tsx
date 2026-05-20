"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="ja">
      <body className="bg-[#FFF9F2]">
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <div className="text-6xl mb-4">🍼</div>
          <h2 className="text-xl font-bold text-[#5C4A3D] mb-2">
            よみこめなかったよ
          </h2>
          <p className="text-[#5C4A3D]/60 text-sm mb-8">
            インターネットのせつぞくをたしかめてね
          </p>
          <button
            onClick={reset}
            className="bg-[#FF8FA3] text-white rounded-2xl px-8 py-4 font-bold"
          >
            もう一度
          </button>
        </div>
      </body>
    </html>
  );
}
