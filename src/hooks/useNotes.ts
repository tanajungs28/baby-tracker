"use client";

import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import type { HourlyNote } from "@/lib/types";
import { toast } from "sonner";

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function useNotes(babyId: string | undefined, date: Date) {
  const supabase = createClient();
  const dateStr = formatDate(date);

  const { data: userId } = useSWR("auth-uid", async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  });

  const { data, mutate } = useSWR<HourlyNote[]>(
    babyId && userId ? `notes-${userId}-${babyId}-${dateStr}` : null,
    async () => {
      const { data, error } = await supabase
        .from("hourly_notes")
        .select("*")
        .eq("baby_id", babyId!)
        .eq("recorded_date", dateStr);
      if (error) throw error;
      return data as HourlyNote[];
    },
    {
      onError: () => toast.error("メモの読み込みに失敗しました"),
      shouldRetryOnError: true,
      errorRetryCount: 3,
    }
  );

  async function saveNote(hour: number, note: string) {
    if (!babyId || !userId) return;
    const trimmed = note.trim();
    if (!trimmed) {
      await deleteNote(hour);
      return;
    }

    const rest = (data ?? []).filter((n) => n.recorded_hour !== hour);
    const newNote = {
      user_id: userId,
      baby_id: babyId,
      recorded_date: dateStr,
      recorded_hour: hour,
      note: trimmed,
    };
    mutate(
      [...rest, { ...newNote, id: "optimistic", created_at: "", updated_at: "" }],
      false
    );

    const { error } = await supabase
      .from("hourly_notes")
      .upsert(newNote, { onConflict: "baby_id,recorded_date,recorded_hour" });

    if (error) toast.error("メモの保存に失敗しました");
    mutate();
  }

  async function deleteNote(hour: number) {
    if (!babyId) return;

    mutate((data ?? []).filter((n) => n.recorded_hour !== hour), false);

    const { error } = await supabase
      .from("hourly_notes")
      .delete()
      .eq("baby_id", babyId)
      .eq("recorded_date", dateStr)
      .eq("recorded_hour", hour);

    if (error) toast.error("メモの削除に失敗しました");
    mutate();
  }

  return { notes: data ?? [], saveNote, deleteNote };
}
