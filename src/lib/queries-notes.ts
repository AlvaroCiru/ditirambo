import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/dal";
import type { DevNote } from "@/lib/types";

export async function getDevNotes(): Promise<DevNote[]> {
  await getAuthedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dev_notes")
    .select("id, titulo, cuerpo, creado_por, creado_en, actualizado_en")
    .order("creado_en", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
