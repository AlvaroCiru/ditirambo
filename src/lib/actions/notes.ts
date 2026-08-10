"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/dal";

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
});

export async function createDevNote(
  _prevState: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const user = await getAuthedUser();

  const parsed = noteSchema.safeParse({
    titulo: formData.get("titulo"),
    cuerpo: formData.get("cuerpo"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("dev_notes").insert({
    titulo: parsed.data.titulo,
    cuerpo: parsed.data.cuerpo ?? "",
    creado_por: user.id,
  });

  if (error) {
    return { error: "No se ha podido guardar la nota." };
  }

  revalidatePath("/notas");
  return { success: true };
}

export async function deleteDevNote(noteId: string) {
  await getAuthedUser();
  const supabase = await createClient();

  const { error } = await supabase.from("dev_notes").delete().eq("id", noteId);

  if (error) throw new Error("No se ha podido borrar la nota.");

  revalidatePath("/notas");
}
