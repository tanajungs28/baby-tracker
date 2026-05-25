"use client";

import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import type { SleepRecord, SleepPerson } from "@/lib/types";
import type { PeriodType } from "@/hooks/useSummary";
import { toast } from "sonner";

function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function useSleep(babyId: string | undefined, date: Date) {
  const supabase = createClient();
  const dateStr = formatLocalDate(date);

  const { data: userId } = useSWR("auth-uid", async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  });

  const { data, mutate, error: fetchError } = useSWR<SleepRecord[]>(
    babyId && userId ? `sleep-${userId}-${babyId}-${dateStr}` : null,
    async () => {
      const { data, error } = await supabase
        .from("sleep_records")
        .select("*")
        .eq("baby_id", babyId!)
        .eq("recorded_date", dateStr);
      if (error) throw error;
      return data as SleepRecord[];
    },
    {
      onError: () => toast.error("データの読み込みに失敗しました"),
      shouldRetryOnError: false,
      errorRetryCount: 0,
    }
  );

  async function toggleSleep(minute: number, person: SleepPerson, currentlyActive: boolean) {
    if (!babyId || !userId || fetchError) return;

    const optimistic = currentlyActive
      ? (data ?? []).filter((r) => !(r.recorded_minute === minute && r.person === person))
      : [
          ...(data ?? []),
          {
            id: "optimistic-" + minute,
            user_id: userId,
            baby_id: babyId,
            person,
            recorded_date: dateStr,
            recorded_minute: minute,
            created_at: "",
            updated_at: "",
          } as SleepRecord,
        ];
    mutate(optimistic, false);

    if (currentlyActive) {
      const { error } = await supabase
        .from("sleep_records")
        .delete()
        .eq("baby_id", babyId)
        .eq("person", person)
        .eq("recorded_date", dateStr)
        .eq("recorded_minute", minute);
      if (error) { toast.error("削除に失敗しました"); mutate(); return; }
    } else {
      const { data: { user } } = await createClient().auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from("sleep_records")
        .upsert(
          { user_id: user.id, baby_id: babyId, person, recorded_date: dateStr, recorded_minute: minute },
          { onConflict: "baby_id,person,recorded_date,recorded_minute" }
        );
      if (error) { toast.error("保存に失敗しました"); mutate(); return; }
    }
    mutate();
  }

  return { sleepRecords: data ?? [], toggleSleep };
}

// --- Sleep summary ---

function getSleepDateRange(anchor: Date, period: PeriodType) {
  const fmt = (d: Date) => {
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${da}`;
  };

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
      getLabel: (dateStr: string) => {
        const d = new Date(dateStr + "T00:00:00");
        return `${d.getMonth() + 1}/${d.getDate()}`;
      },
    };
  }

  if (period === "week") {
    const weeks = Array.from({ length: 6 }, (_, i) => {
      const start = new Date(anchor);
      start.setDate(start.getDate() - (5 - i) * 7);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      return { start, end, label: `${start.getMonth() + 1}/${start.getDate()}〜` };
    });
    return {
      start: fmt(weeks[0].start),
      end: fmt(anchor),
      labels: weeks.map((w) => w.label),
      getLabel: (dateStr: string) => {
        const d = new Date(dateStr + "T00:00:00");
        const w = weeks.find(({ start, end }) => d >= start && d <= end);
        return w ? w.label : weeks[0].label;
      },
    };
  }

  // month
  const months = Array.from({ length: 3 }, (_, i) =>
    new Date(anchor.getFullYear(), anchor.getMonth() - 2 + i, 1)
  );
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    start: fmt(months[0]),
    end: fmt(new Date(months[2].getFullYear(), months[2].getMonth() + 1, 0)),
    labels: months.map((d) => `${d.getFullYear()}/${pad(d.getMonth() + 1)}`),
    getLabel: (dateStr: string) => {
      const d = new Date(dateStr + "T00:00:00");
      return `${d.getFullYear()}/${pad(d.getMonth() + 1)}`;
    },
  };
}

export interface SleepSummaryData {
  labels: string[];
  papa: number[];
  mama: number[];
  totals: { papa: number; mama: number };
}

export function useSleepSummary(
  babyId: string | undefined,
  anchor: Date,
  period: PeriodType
) {
  const supabase = createClient();
  const { start, end, labels, getLabel } = getSleepDateRange(anchor, period);

  const { data: userId } = useSWR("auth-uid", async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  });

  const { data } = useSWR<SleepSummaryData>(
    babyId && userId ? `sleep-summary-${userId}-${babyId}-${period}-${start}-${end}` : null,
    async () => {
      const { data, error } = await supabase
        .from("sleep_records")
        .select("*")
        .eq("baby_id", babyId!)
        .gte("recorded_date", start)
        .lte("recorded_date", end);
      if (error) throw error;

      const records = (data ?? []) as SleepRecord[];

      const papaMins: { [l: string]: number } = {};
      const mamaMins: { [l: string]: number } = {};
      labels.forEach((l) => { papaMins[l] = 0; mamaMins[l] = 0; });

      records.forEach((r) => {
        const label = getLabel(r.recorded_date);
        if (r.person === "papa") papaMins[label] = (papaMins[label] ?? 0) + 30;
        else mamaMins[label] = (mamaMins[label] ?? 0) + 30;
      });

      const toH = (m: number) => Math.round((m / 60) * 10) / 10;
      const papaH = labels.map((l) => toH(papaMins[l] ?? 0));
      const mamaH = labels.map((l) => toH(mamaMins[l] ?? 0));

      return {
        labels,
        papa: papaH,
        mama: mamaH,
        totals: {
          papa: Math.round(papaH.reduce((a, b) => a + b, 0) * 10) / 10,
          mama: Math.round(mamaH.reduce((a, b) => a + b, 0) * 10) / 10,
        },
      };
    }
  );

  return { sleepSummary: data ?? null, dateRange: { start, end } };
}
