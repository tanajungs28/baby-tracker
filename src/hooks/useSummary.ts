"use client";

import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import type { BabyRecord, RecordType } from "@/lib/types";

export type PeriodType = "day" | "week" | "month";

function getDateRange(
  anchor: Date,
  period: PeriodType
): { start: string; end: string; labels: string[] } {
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const pad = (n: number) => String(n).padStart(2, "0");

  if (period === "day") {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(anchor);
      d.setDate(d.getDate() - 6 + i);
      return d;
    });
    return {
      start: fmt(days[0]),
      end: fmt(days[6]),
      labels: days.map((d) => `${d.getMonth() + 1}/${d.getDate()}`),
    };
  }

  if (period === "week") {
    const weeks = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(anchor);
      d.setDate(d.getDate() - (5 - i) * 7);
      return d;
    });
    return {
      start: fmt(weeks[0]),
      end: fmt(anchor),
      labels: weeks.map((d) => `${d.getMonth() + 1}/${d.getDate()}〜`),
    };
  }

  const months = Array.from({ length: 3 }, (_, i) => {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - 2 + i, 1);
    return d;
  });
  return {
    start: fmt(months[0]),
    end: fmt(new Date(months[2].getFullYear(), months[2].getMonth() + 1, 0)),
    labels: months.map((d) => `${d.getFullYear()}/${pad(d.getMonth() + 1)}`),
  };
}

export interface SummaryData {
  labels: string[];
  breastfeeding: number[];
  pumping: number[];
  formula: number[];
  pee: number[];
  poop: number[];
  totals: { [K in RecordType]: number };
}

export function useSummary(
  babyId: string | undefined,
  anchor: Date,
  period: PeriodType
) {
  const supabase = createClient();
  const { start, end, labels } = getDateRange(anchor, period);

  const { data: userId } = useSWR("auth-uid", async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  });

  const { data } = useSWR<SummaryData>(
    babyId && userId ? `summary-${userId}-${babyId}-${period}-${start}-${end}` : null,
    async () => {
      const { data: rows } = await supabase
        .from("records")
        .select("*")
        .eq("baby_id", babyId!)
        .gte("recorded_date", start)
        .lte("recorded_date", end);

      const records = (rows ?? []) as BabyRecord[];

      const aggregated: {
        [label: string]: { [K in RecordType]?: number };
      } = {};
      labels.forEach((l) => (aggregated[l] = {}));

      records.forEach((r) => {
        let label: string;
        if (period === "day") {
          const d = new Date(r.recorded_date + "T00:00:00");
          label = `${d.getMonth() + 1}/${d.getDate()}`;
        } else if (period === "week") {
          const { labels: wLabels } = getDateRange(anchor, "week");
          const rDate = new Date(r.recorded_date + "T00:00:00");
          const idx = wLabels.findIndex((_, i) => {
            const weekStart = new Date(anchor);
            weekStart.setDate(weekStart.getDate() - (5 - i) * 7);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            return rDate >= weekStart && rDate <= weekEnd;
          });
          label = idx >= 0 ? wLabels[idx] : wLabels[0];
        } else {
          const d = new Date(r.recorded_date + "T00:00:00");
          label = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}`;
        }

        if (!aggregated[label]) aggregated[label] = {};
        const prev = aggregated[label][r.type] ?? 0;
        aggregated[label][r.type] = prev + (r.count ?? 0) + (r.amount_ml ?? 0);
      });

      const totals: { [K in RecordType]: number } = {
        breastfeeding: 0,
        pumping: 0,
        formula: 0,
        pee: 0,
        poop: 0,
      };
      records.forEach((r) => {
        totals[r.type] += r.count ?? r.amount_ml ?? 0;
      });

      return {
        labels,
        breastfeeding: labels.map((l) => aggregated[l]?.breastfeeding ?? 0),
        pumping: labels.map((l) => aggregated[l]?.pumping ?? 0),
        formula: labels.map((l) => aggregated[l]?.formula ?? 0),
        pee: labels.map((l) => aggregated[l]?.pee ?? 0),
        poop: labels.map((l) => aggregated[l]?.poop ?? 0),
        totals,
      };
    }
  );

  return { summary: data ?? null, dateRange: { start, end } };
}
