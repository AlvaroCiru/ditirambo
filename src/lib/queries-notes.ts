import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/dal";
import { NOTE_PRIORITY_WEIGHT } from "@/lib/notes-meta";
import type { DevNote } from "@/lib/types";

const NOTE_COLUMNS =
  "id, titulo, cuerpo, estado, prioridad, creado_por, creado_en, actualizado_en" as const;

function sortForBoard(a: DevNote, b: DevNote) {
  const byPriority =
    NOTE_PRIORITY_WEIGHT[a.prioridad] - NOTE_PRIORITY_WEIGHT[b.prioridad];
  if (byPriority !== 0) return byPriority;
  return new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime();
}

export async function getDevNotes(): Promise<DevNote[]> {
  await getAuthedUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("dev_notes")
    .select(NOTE_COLUMNS)
    .order("creado_en", { ascending: false });

  if (error) throw error;
  return (data ?? []) as DevNote[];
}

export async function getDevNotesForBoard(): Promise<DevNote[]> {
  const notes = await getDevNotes();
  return [...notes].sort(sortForBoard);
}
