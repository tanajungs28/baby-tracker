import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center bg-[#FFF9F2]">
      {/* かわいい月と星のイラスト */}
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="mb-6"
      >
        {/* 月 */}
        <circle cx="80" cy="80" r="40" fill="#FFD6E0" />
        <circle cx="96" cy="68" r="32" fill="#FFF9F2" />
        {/* ほっぺ */}
        <ellipse cx="62" cy="88" rx="7" ry="5" fill="#FF8FA3" opacity="0.6" />
        <ellipse cx="90" cy="88" rx="7" ry="5" fill="#FF8FA3" opacity="0.6" />
        {/* 目 */}
        <circle cx="66" cy="78" r="3" fill="#5C4A3D" />
        <circle cx="82" cy="78" r="3" fill="#5C4A3D" />
        {/* 口 */}
        <path d="M 69 88 Q 74 94 81 88" stroke="#5C4A3D" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* 星 */}
        <text x="20" y="40" fontSize="20" fill="#FEF08A">★</text>
        <text x="120" y="50" fontSize="14" fill="#D8B4FE">★</text>
        <text x="130" y="110" fontSize="18" fill="#BAE6FD">★</text>
        <text x="10" y="120" fontSize="12" fill="#FFD6E0">★</text>
      </svg>

      <h2 className="text-2xl font-bold text-[#5C4A3D] mb-2">
        みつからないよ
      </h2>
      <p className="text-[#5C4A3D]/60 text-sm mb-8">
        このページはないみたい。
        <br />
        きろく画面にもどってね。
      </p>
      <Link
        href="/daily"
        aria-label="きろく画面へ戻る"
        className="bg-[#FF8FA3] text-white rounded-2xl px-8 py-4 font-bold active:scale-95 transition-transform inline-block"
      >
        きろく画面へ 🌸
      </Link>
    </div>
  );
}
