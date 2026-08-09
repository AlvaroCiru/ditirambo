"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/dal";
import { workSchema, statusSchema } from "@/lib/validations";

export interface WorkFormState {
  error?: string;
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function uploadCoverImage(
  supabase: SupabaseServerClient,
  userId: string,
  file: File,
): Promise<{ url?: string; error?: string }> {
  if (file.size > 5 * 1024 * 1024) {
    return { error: "La imagen no puede superar los 5 MB." };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from("covers")
    .upload(path, file);

  if (uploadError) {
    return { error: "No se ha podido subir la imagen." };
  }

  return {
    url: supabase.storage.from("covers").getPublicUrl(path).data.publicUrl,
  };
}

export async function createWork(
  _prevState: WorkFormState,
  formData: FormData,
): Promise<WorkFormState> {
  const user = await getAuthedUser();

  const parsed = workSchema.safeParse({
    tipo: formData.get("tipo"),
    titulo: formData.get("titulo"),
    autor_creador: formData.get("autor_creador"),
    anio: formData.get("anio"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();

  let imagenUrl: string | null = null;
  const imagenFile = formData.get("imagen");

  if (imagenFile instanceof File && imagenFile.size > 0) {
    const uploaded = await uploadCoverImage(supabase, user.id, imagenFile);
    if (uploaded.error) return { error: uploaded.error };
    imagenUrl = uploaded.url ?? null;
  }

  const { data, error } = await supabase
    .from("works")
    .insert({
      tipo: parsed.data.tipo,
      titulo: parsed.data.titulo,
      autor_creador: parsed.data.autor_creador ?? null,
      anio: parsed.data.anio ?? null,
      imagen_url: imagenUrl,
      creado_por: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "No se ha podido guardar la obra." };
  }

  revalidatePath("/obras");
  revalidatePath("/");
  redirect(`/obras/${data.id}`);
}

export async function updateWork(
  workId: string,
  _prevState: WorkFormState,
  formData: FormData,
): Promise<WorkFormState> {
  const user = await getAuthedUser();

  const parsed = workSchema.safeParse({
    tipo: formData.get("tipo"),
    titulo: formData.get("titulo"),
    autor_creador: formData.get("autor_creador"),
    anio: formData.get("anio"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();

  const updates: {
    tipo: string;
    titulo: string;
    autor_creador: string | null;
    anio: number | null;
    imagen_url?: string;
  } = {
    tipo: parsed.data.tipo,
    titulo: parsed.data.titulo,
    autor_creador: parsed.data.autor_creador ?? null,
    anio: parsed.data.anio ?? null,
  };

  const imagenFile = formData.get("imagen");
  if (imagenFile instanceof File && imagenFile.size > 0) {
    const uploaded = await uploadCoverImage(supabase, user.id, imagenFile);
    if (uploaded.error) return { error: uploaded.error };
    updates.imagen_url = uploaded.url;
  }

  const { error } = await supabase
    .from("works")
    .update(updates)
    .eq("id", workId);

  if (error) {
    return { error: "No se ha podido actualizar la obra." };
  }

  revalidatePath(`/obras/${workId}`);
  revalidatePath("/obras");
  revalidatePath("/");
  redirect(`/obras/${workId}`);
}

export async function updateWorkStatus(workId: string, estado: string) {
  await getAuthedUser();
  const parsedEstado = statusSchema.parse(estado);

  const supabase = await createClient();
  const { error } = await supabase
    .from("works")
    .update({ estado: parsedEstado })
    .eq("id", workId);

  if (error) throw new Error("No se ha podido actualizar el estado.");

  revalidatePath(`/obras/${workId}`);
  revalidatePath("/obras");
  revalidatePath("/");
}

export async function deleteWork(workId: string) {
  await getAuthedUser();
  const supabase = await createClient();

  const { error } = await supabase.from("works").delete().eq("id", workId);

  if (error) throw new Error("No se ha podido borrar la obra.");

  revalidatePath("/obras");
  revalidatePath("/");
  redirect("/obras");
}
