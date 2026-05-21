"use client";

import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import type { Baby } from "@/lib/types";

export function useBaby() {
  const supabase = createClient();

  const { data: userId } = useSWR("auth-uid", async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id ?? null;
  });

  const { data } = useSWR<Baby | null>(
    userId ? `baby-${userId}` : null,
    async () => {
      const { data } = await supabase
        .from("babies")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(1)
        .single();
      return (data as Baby) ?? null;
    }
  );

  return { baby: data ?? null };
}
