"use client";

import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import type { SleepRecord, SleepPerson } from "@/lib/types";
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

export function useSleepSummary(babyId: string | undefined) {
  const supabase = createClient();

  const { data: userId } = useSWR("auth-uid", async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - 6 + i);
    return d;
  });
  const start = formatLocalDate(days[0]);
  const end = formatLocalDate(days[6]);

  const { data } = useSWR(
    babyId && userId ? `sleep-summary-${userId}-${babyId}-${start}-${end}` : null,
    async () => {
      const { data, error } = await supabase
        .from("sleep_records")
        .select("*")
        .eq("baby_id", babyId!)
        .gte("recorded_date", start)
        .lte("recorded_date", end);
      if (error) throw error;

      return days.map((d) => {
        const dateStr = formatLocalDate(d);
        const dayRecords = (data as SleepRecord[]).filter((r) => r.recorded_date === dateStr);
        // スロット数 × 30分 ÷ 60 = 時間数
        return {
          label: `${d.getMonth() + 1}/${d.getDate()}`,
          papa: Math.round((dayRecords.filter((r) => r.person === "papa").length * 30 / 60) * 10) / 10,
          mama: Math.round((dayRecords.filter((r) => r.person === "mama").length * 30 / 60) * 10) / 10,
        };
      });
    }
  );

  return { chartData: data ?? [] };
}
