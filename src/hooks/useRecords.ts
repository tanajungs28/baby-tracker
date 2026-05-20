"use client";

import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import type { BabyRecord, RecordType } from "@/lib/types";
import { toast } from "sonner";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function useRecords(babyId: string | undefined, date: Date) {
  const supabase = createClient();
  const dateStr = formatDate(date);

  const { data, mutate, error, isLoading } = useSWR<BabyRecord[]>(
    babyId ? `records-${babyId}-${dateStr}` : null,
    async () => {
      const { data, error } = await supabase
        .from("records")
        .select("*")
        .eq("baby_id", babyId!)
        .eq("recorded_date", dateStr);
      if (error) throw error;
      return data as BabyRecord[];
    },
    {
      onError: () => toast.error("データの読み込みに失敗しました"),
      shouldRetryOnError: true,
      errorRetryCount: 3,
    }
  );

  async function upsertRecord(
    hour: number,
    type: RecordType,
    count: number | null,
    amount_ml: number | null
  ) {
    if (!babyId) return;
    const supabaseClient = createClient();
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const newRecord: Partial<BabyRecord> = {
      user_id: user.id,
      baby_id: babyId,
      recorded_date: dateStr,
      recorded_hour: hour,
      type,
      count,
      amount_ml,
    };

    // 楽観的更新
    const optimistic = (data ?? []).filter(
      (r) => !(r.recorded_hour === hour && r.type === type)
    );
    if (count !== null || amount_ml !== null) {
      optimistic.push({ ...newRecord, id: "optimistic", created_at: "", updated_at: "" } as BabyRecord);
    }
    mutate(optimistic, false);

    const { error } = await supabase
      .from("records")
      .upsert(
        { ...newRecord },
        { onConflict: "user_id,baby_id,recorded_date,recorded_hour,type" }
      );

    if (error) {
      toast.error("保存に失敗しました");
      mutate();
    } else {
      mutate();
    }
  }

  async function deleteRecord(hour: number, type: RecordType) {
    if (!babyId) return;

    const optimistic = (data ?? []).filter(
      (r) => !(r.recorded_hour === hour && r.type === type)
    );
    mutate(optimistic, false);

    const { error } = await supabase
      .from("records")
      .delete()
      .eq("baby_id", babyId)
      .eq("recorded_date", dateStr)
      .eq("recorded_hour", hour)
      .eq("type", type);

    if (error) {
      toast.error("削除に失敗しました");
      mutate();
    } else {
      mutate();
    }
  }

  return { records: data ?? [], upsertRecord, deleteRecord, isLoading, error };
}
