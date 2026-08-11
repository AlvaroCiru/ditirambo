import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export const getAuthedUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
});

export const getProfiles = cache(async (): Promise<Profile[]> => {
  await getAuthedUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, es_admin");

  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    es_admin: Boolean(row.es_admin),
  }));
});

export const isCurrentUserAdmin = cache(async (): Promise<boolean> => {
  const user = await getAuthedUser();
  const profiles = await getProfiles();
  return Boolean(profiles.find((p) => p.id === user.id)?.es_admin);
});

export async function requireAdmin() {
  const ok = await isCurrentUserAdmin();
  if (!ok) redirect("/resenas");
}
