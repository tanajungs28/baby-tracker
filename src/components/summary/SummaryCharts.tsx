"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { SummaryData } from "@/hooks/useSummary";

interface SummaryChartsProps {
  summary: SummaryData;
}

export default function SummaryCharts({ summary }: SummaryChartsProps) {
  const chartData = summary.labels.map((label, i) => ({
    name: label,
    授乳: summary.breastfeeding[i],
    授乳量: summary.breastfeedingMl[i],
    搾乳: summary.pumping[i],
    ミルク: summary.formula[i],
    尿: summary.pee[i],
    便: summary.poop[i],
  }));

  const hasData = chartData.some(
    (d) =>
      d.授乳 > 0 ||
      d.授乳量 > 0 ||
      d.搾乳 > 0 ||
      d.ミルク > 0 ||
      d.尿 > 0 ||
      d.便 > 0
  );

  if (!hasData) {
    return <EmptyState />;
  }

  const axisStyle = { fill: "#5C4A3D", fontSize: 10 };

  const metrics: Metric[] = [
    { label: "授乳", total: summary.totals.breastfeeding, unit: "回", color: "#FFB6C8" },
    { label: "授乳量", total: summary.totals.breastfeedingMl, unit: "ml", color: "#FFB6C8" },
    { label: "搾乳", total: summary.totals.pumping, unit: "ml", color: "#D8B4FE" },
    { label: "ミルク", total: summary.totals.formula, unit: "ml", color: "#FEF08A" },
    { label: "尿", total: summary.totals.pee, unit: "回", color: "#BAE6FD" },
    { label: "便", total: summary.totals.poop, unit: "回", color: "#C4A882" },
  ];

  return (
    <div className="space-y-6 px-4 py-2">
      {/* 授乳回数 */}
      <ChartCard title="🌸 授乳回数">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#FFD6E0" />
            <XAxis dataKey="name" tick={axisStyle} />
            <YAxis tick={axisStyle} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Bar dataKey="授乳" fill="#FFB6C8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 飲んだ量（授乳量・ミルク・搾乳） */}
      <ChartCard title="🍼 飲んだ量 (ml)">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#FFD6E0" />
            <XAxis dataKey="name" tick={axisStyle} />
            <YAxis tick={axisStyle} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Bar dataKey="授乳量" stackId="a" fill="#FFB6C8" radius={[0, 0, 0, 0]} />
            <Bar dataKey="ミルク" stackId="a" fill="#FEF08A" radius={[0, 0, 0, 0]} />
            <Bar dataKey="搾乳" stackId="a" fill="#D8B4FE" radius={[4, 4, 0, 0]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 尿・便回数 */}
      <ChartCard title="💧 尿・便の回数">
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#FFD6E0" />
            <XAxis dataKey="name" tick={axisStyle} />
            <YAxis tick={axisStyle} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
            <Line type="monotone" dataKey="尿" stroke="#BAE6FD" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="便" stroke="#C4A882" strokeWidth={2} dot={{ r: 3 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 合計カード */}
      <MetricCard title="📋 期間の合計" metrics={metrics} mode="total" days={summary.days} />

      {/* 平均カード */}
      <MetricCard title="📊 1日あたりの平均" metrics={metrics} mode="average" days={summary.days} />
    </div>
  );
}

interface Metric {
  label: string;
  total: number;
  unit: "回" | "ml";
  color: string;
}

function formatAverage(total: number, days: number, unit: "回" | "ml"): string {
  if (days <= 0) return "0";
  const value = total / days;
  if (unit === "ml") return String(Math.round(value));
  return (Math.round(value * 10) / 10).toString();
}

function MetricCard({
  title,
  metrics,
  mode,
  days,
}: {
  title: string;
  metrics: Metric[];
  mode: "total" | "average";
  days: number;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border-2 border-[#FFD6E0]">
      <h3 className="font-bold text-[#5C4A3D] mb-3">{title}</h3>
      <div className="grid grid-cols-3 gap-2">
        {metrics.map(({ label, total, unit, color }) => {
          const display =
            mode === "total"
              ? String(total)
              : formatAverage(total, days, unit);
          return (
            <div
              key={label}
              className="flex flex-col items-center rounded-xl p-2"
              style={{ backgroundColor: `${color}40` }}
            >
              <span className="text-lg font-bold text-[#5C4A3D] font-['Nunito']">
                {display}
              </span>
              <span className="text-[10px] text-[#5C4A3D]/60">{unit}</span>
              <span className="text-[10px] text-[#5C4A3D] mt-0.5">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4 border-2 border-[#FFD6E0]">
      <h3 className="font-bold text-[#5C4A3D] mb-3 text-sm">{title}</h3>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <svg
        width="140"
        height="140"
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="mb-6"
      >
        {/* ほしぞら */}
        <circle cx="70" cy="70" r="60" fill="#FFF9F2" />
        {/* 哺乳瓶 */}
        <rect x="52" y="45" width="36" height="55" rx="12" fill="#CDE8FF" />
        <rect x="58" y="35" width="24" height="16" rx="6" fill="#BAE6FD" />
        <rect x="62" y="28" width="16" height="10" rx="4" fill="#5C4A3D" opacity="0.2" />
        {/* ミルクの線 */}
        <line x1="60" y1="68" x2="80" y2="68" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
        <line x1="60" y1="78" x2="75" y2="78" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
        {/* 星 */}
        <circle cx="28" cy="35" r="4" fill="#FFD6E0" />
        <circle cx="115" cy="45" r="3" fill="#D8B4FE" />
        <circle cx="22" cy="85" r="3" fill="#D4F1D4" />
        <circle cx="118" cy="90" r="4" fill="#FEF08A" />
        {/* zzz */}
        <text x="90" y="50" fontSize="11" fill="#5C4A3D" opacity="0.4" fontWeight="bold">z</text>
        <text x="99" y="40" fontSize="14" fill="#5C4A3D" opacity="0.3" fontWeight="bold">z</text>
        <text x="110" y="28" fontSize="17" fill="#5C4A3D" opacity="0.2" fontWeight="bold">z</text>
      </svg>

      <p className="text-lg font-bold text-[#5C4A3D] mb-2">まだ記録がないよ</p>
      <p className="text-[#5C4A3D]/60 text-sm leading-relaxed">
        きろく画面からタップして
        <br />
        記録を追加してみてね 🌸
      </p>
    </div>
  );
}
