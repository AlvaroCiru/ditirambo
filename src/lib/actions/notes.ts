"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/dal";
import {
  NOTE_PRIORITY_ORDER,
  NOTE_STATUS_ORDER,
} from "@/lib/notes-meta";
import type { DevNotePriority, DevNoteStatus } from "@/lib/types";

export interface NoteFormState {
  error?: string;
  success?: boolean;
}

const noteSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "El título no puede estar vacío.")
    .max(160),
  cuerpo: z.string().trim().max(8000).optional(),
  prioridad: z.enum(NOTE_PRIORITY_ORDER).default("media"),
});

function revalidateNotes() {
  revalidatePath("/notas");
  revalidatePath("/notas/tablero");
}

export async function createDevNote(
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const user = await getAuthedUser();

  const parsed = noteSchema.safeParse({
    titulo: formData.get("titulo"),
    cuerpo: formData.get("cuerpo"),
    prioridad: formData.get("prioridad") || "media",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("dev_notes").insert({
    titulo: parsed.data.titulo,
    cuerpo: parsed.data.cuerpo ?? "",
    prioridad: parsed.data.prioridad,
    estado: "por_hacer",
    creado_por: user.id,
  });

  if (error) {
    return { error: "No se ha podido guardar la nota." };
  }

  revalidateNotes();
  return { success: true };
}

export async function updateDevNoteStatus(
  noteId: string,
  estado: string,
): Promise<void> {
  await getAuthedUser();
  if (!NOTE_STATUS_ORDER.includes(estado as DevNoteStatus)) {
    throw new Error("Estado no válido.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("dev_notes")
    .update({
      estado: estado as DevNoteStatus,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", noteId);

  if (error) throw new Error("No se ha podido actualizar el estado.");
  revalidateNotes();
}

export async function updateDevNotePriority(
  noteId: string,
  prioridad: string,
): Promise<void> {
  await getAuthedUser();
  if (!NOTE_PRIORITY_ORDER.includes(prioridad as DevNotePriority)) {
    throw new Error("Prioridad no válida.");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("dev_notes")
    .update({
      prioridad: prioridad as DevNotePriority,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", noteId);

  if (error) throw new Error("No se ha podido actualizar la prioridad.");
  revalidateNotes();
}

export async function deleteDevNote(noteId: string) {
  await getAuthedUser();
  const supabase = await createClient();

  const { error } = await supabase.from("dev_notes").delete().eq("id", noteId);

  if (error) throw new Error("No se ha podido borrar la nota.");

  revalidateNotes();
}
