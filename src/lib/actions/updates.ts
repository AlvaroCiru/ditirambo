"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser, getProfiles } from "@/lib/dal";
import { getNextAppVersion } from "@/lib/queries-updates";
import { formatAppVersion } from "@/lib/updates-meta";
import { sendAvisosToUsers } from "@/lib/push/send";

export interface UpdateFormState {
  error?: string;
  success?: boolean;
}

const updateSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(1, "El título no puede estar vacío.")
    .max(160),
  cuerpo: z
    .string()
    .trim()
    .min(1, "El detalle no puede estar vacío.")
    .max(8000),
  /** Si se indica, fuerza major (p. ej. al subir de v.1.xx a v.2.01). */
  bumpMajor: z.boolean().optional(),
});

function revalidateUpdates() {
  revalidatePath("/notas/actualizaciones");
  revalidatePath("/notas");
}

async function avisarNuevaActualizacion(options: {
  major: number;
  minor: number;
  titulo: string;
}) {
  const version = formatAppVersion(options.major, options.minor);
  const profiles = await getProfiles();
  await sendAvisosToUsers(
    profiles.map((p) => p.id),
    {
      title: `Actualización ${version}`,
      body: options.titulo,
      url: "/notas/actualizaciones",
    },
  );
}

export async function createAppUpdate(
  _prevState: UpdateFormState,
  formData: FormData,
): Promise<UpdateFormState> {
  const user = await getAuthedUser();

  const parsed = updateSchema.safeParse({
    titulo: formData.get("titulo"),
    cuerpo: formData.get("cuerpo"),
    bumpMajor: formData.get("bumpMajor") === "si",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  let { major, minor } = await getNextAppVersion();
  if (parsed.data.bumpMajor) {
    major += 1;
    minor = 1;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("app_updates")
    .insert({
      version_major: major,
      version_minor: minor,
      titulo: parsed.data.titulo,
      cuerpo: parsed.data.cuerpo,
      creado_por: user.id,
    })
    .select("version_major, version_minor, titulo")
    .single();

  if (error || !data) {
    return { error: "No se ha podido publicar la actualización." };
  }

  void avisarNuevaActualizacion({
    major: data.version_major as number,
    minor: data.version_minor as number,
    titulo: data.titulo as string,
  });

  revalidateUpdates();
  return { success: true };
}

export async function updateAppUpdate(
  updateId: string,
  _prevState: UpdateFormState,
  formData: FormData,
): Promise<UpdateFormState> {
  await getAuthedUser();

  const parsed = updateSchema.safeParse({
    titulo: formData.get("titulo"),
    cuerpo: formData.get("cuerpo"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("app_updates")
    .update({
      titulo: parsed.data.titulo,
      cuerpo: parsed.data.cuerpo,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", updateId);

  if (error) {
    return { error: "No se ha podido guardar la actualización." };
  }

  revalidateUpdates();
  return { success: true };
}

export async function deleteAppUpdate(updateId: string) {
  await getAuthedUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("app_updates")
    .delete()
    .eq("id", updateId);

  if (error) throw new Error("No se ha podido borrar la actualización.");

  revalidateUpdates();
}
