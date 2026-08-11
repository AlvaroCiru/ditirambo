import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/dal";
import type { AppUpdate } from "@/lib/types";

const UPDATE_COLUMNS =
  "id, version_major, version_minor, titulo, cuerpo, creado_por, creado_en, actualizado_en" as const;

export async function getAppUpdates(): Promise<AppUpdate[]> {
  await getAuthedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("app_updates")
    .select(UPDATE_COLUMNS)
    .order("version_major", { ascending: false })
    .order("version_minor", { ascending: false });

  if (error) throw error;
  return (data ?? []) as AppUpdate[];
}

export async function getNextAppVersion(): Promise<{
  major: number;
  minor: number;
}> {
  const updates = await getAppUpdates();
  if (updates.length === 0) return { major: 1, minor: 1 };

  const latest = updates[0];
  const nextMinor = latest.version_minor + 1;
  if (nextMinor <= 99) {
    return { major: latest.version_major, minor: nextMinor };
  }
  return { major: latest.version_major + 1, minor: 1 };
}
