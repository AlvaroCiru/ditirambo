import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

/** Renovar con Auth solo cerca de la caducidad del access token. */
const REFRESH_IF_EXPIRES_WITHIN_MS = 5 * 60 * 1000;

export const getAuthedUser = cache(async () => {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    const expiresAtMs = (session.expires_at ?? 0) * 1000;
    const stillFresh = expiresAtMs - Date.now() >= REFRESH_IF_EXPIRES_WITHIN_MS;
    if (stillFresh) {
      return session.user;
    }
  }

  // Token ausente, caducado o a punto de caducar → validar/renovar en Auth.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
});

/** Perfil del usuario actual (1 fila). Preferible al listado completo en el shell. */
export const getMyProfile = cache(async (): Promise<Profile | null> => {
  const user = await getAuthedUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, es_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return { ...data, es_admin: Boolean(data.es_admin) };
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
  const me = await getMyProfile();
  return Boolean(me?.es_admin);
});

export async function requireAdmin() {
  const ok = await isCurrentUserAdmin();
  if (!ok) redirect("/resenas");
}
