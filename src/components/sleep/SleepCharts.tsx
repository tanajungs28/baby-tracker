"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { SleepSummaryData } from "@/hooks/useSleep";
import type { PeriodType } from "@/hooks/useSummary";

interface SleepChartsProps {
  summary: SleepSummaryData;
  period: PeriodType;
}

function fmtH(h: number) {
  if (h === 0) return "−";
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  return mm ? `${hh}h${mm}m` : `${hh}h`;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4 border-2 border-[#FFD6E0]">
      <h3 className="font-bold text-[#5C4A3D] mb-3 text-sm">{title}</h3>
      {children}
    </div>
  );
}

export default function SleepCharts({ summary, period }: SleepChartsProps) {
  const hasData = summary.papa.some((v) => v > 0) || summary.mama.some((v) => v > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#5C4A3D]/40">
        <p className="text-4xl mb-3">😴</p>
        <p className="text-sm">まだデータがありません</p>
        <p className="text-xs mt-1">きろくタブから睡眠を記録してください</p>
      </div>
    );
  }

  const chartData = summary.labels.map((label, i) => ({
    name: label,
    パパ: summary.papa[i],
    ママ: summary.mama[i],
  }));

  const n = summary.labels.length;
  const avgPapa = Math.round((summary.totals.papa / n) * 10) / 10;
  const avgMama = Math.round((summary.totals.mama / n) * 10) / 10;
  const avgData = [
    { name: "👨 パパ", 時間: avgPapa },
    { name: "👩 ママ", 時間: avgMama },
  ];
  const AVG_COLORS = ["#A8D8EA", "#FFB6C8"];

  const unitLabel =
    period === "day" ? "1日あたり平均" :
    period === "week" ? "1週あたり平均" : "1ヶ月あたり平均";

  const axisStyle = { fill: "#5C4A3D", fontSize: 10 };

  return (
    <div className="space-y-4 px-4 py-3">
      {/* 睡眠時間グラフ */}
      <ChartCard title="😴 睡眠時間（時間）">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#FFD6E0" />
            <XAxis dataKey="name" tick={axisStyle} />
            <YAxis tick={axisStyle} allowDecimals />
            <Tooltip
              contentStyle={{ borderRadius: 12, fontSize: 12 }}
              formatter={(v) => [`${v}時間`]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="パパ" fill="#A8D8EA" radius={[4, 4, 0, 0]} name="👨 パパ" />
            <Bar dataKey="ママ" fill="#FFB6C8" radius={[4, 4, 0, 0]} name="👩 ママ" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 期間の合計 */}
      <ChartCard title="📋 期間の合計">
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { label: "👨 パパ", value: summary.totals.papa, color: "#A8D8EA" },
              { label: "👩 ママ", value: summary.totals.mama, color: "#FFB6C8" },
            ] as const
          ).map(({ label, value, color }) => (
            <div
              key={label}
              className="flex flex-col items-center rounded-xl py-4"
              style={{ backgroundColor: `${color}40` }}
            >
              <span className="text-2xl font-bold text-[#5C4A3D]">{fmtH(value)}</span>
              <span className="text-xs text-[#5C4A3D]/60 mt-1">{label}</span>
            </div>
          ))}
        </div>
      </ChartCard>

      {/* 平均グラフ */}
      <ChartCard title={`📊 ${unitLabel}`}>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={avgData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#FFD6E0" />
            <XAxis dataKey="name" tick={axisStyle} />
            <YAxis tick={axisStyle} allowDecimals />
            <Tooltip
              contentStyle={{ borderRadius: 12, fontSize: 12 }}
              formatter={(v) => [`${v}時間`]}
            />
            <Bar dataKey="時間" radius={[4, 4, 0, 0]}>
              {avgData.map((_, i) => (
                <Cell key={i} fill={AVG_COLORS[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
