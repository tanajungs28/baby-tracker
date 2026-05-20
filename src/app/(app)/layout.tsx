import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppLayoutClient from "./layout-client";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: babies } = await supabase
    .from("babies")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1);

  const baby = babies?.[0] ?? null;

  return (
    <AppLayoutClient user={user} initialBaby={baby}>
      {children}
    </AppLayoutClient>
  );
}
