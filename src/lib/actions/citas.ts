"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser, getProfiles } from "@/lib/dal";
import { citaSchema } from "@/lib/validations";
import { isAvisosWebEnabled } from "@/lib/push/config";
import { sendTemplatedAviso } from "@/lib/push/templates";

export interface CitaFormState {
  error?: string;
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function revalidateCitas(citaId?: string) {
  revalidatePath("/citas");
  revalidatePath("/citas/lista");
  revalidatePath("/citas/nueva");
  if (citaId) {
    revalidatePath(`/citas/${citaId}`);
    revalidatePath(`/citas/${citaId}/editar`);
  }
}

async function uploadCitaImage(
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
    .from("citas")
    .upload(path, file);

  if (uploadError) {
    return { error: "No se ha podido subir la imagen." };
  }

  return {
    url: supabase.storage.from("citas").getPublicUrl(path).data.publicUrl,
  };
}

async function notifyCitaPropuesta(options: {
  citaId: string;
  titulo: string;
  authorId: string;
}) {
  if (!isAvisosWebEnabled()) return;

  const profiles = await getProfiles();
  const partner = profiles.find((p) => p.id !== options.authorId);
  if (!partner) return;

  const author = profiles.find((p) => p.id === options.authorId);
  await sendTemplatedAviso({
    key: "cita_propuesta",
    userIds: [partner.id],
    vars: {
      nombre: author?.display_name ?? "Tu pareja",
      titulo: options.titulo,
    },
    url: `/citas/${options.citaId}`,
  });
}

async function notifyCitaAceptada(options: {
  citaId: string;
  titulo: string;
  proposerId: string;
  accepterId: string;
}) {
  if (!isAvisosWebEnabled()) return;

  const profiles = await getProfiles();
  const accepter = profiles.find((p) => p.id === options.accepterId);
  await sendTemplatedAviso({
    key: "cita_aceptada",
    userIds: [options.proposerId],
    vars: {
      nombre: accepter?.display_name ?? "Tu pareja",
      titulo: options.titulo,
    },
    url: `/citas/${options.citaId}`,
  });
}

export async function createCita(
  _prevState: CitaFormState,
  formData: FormData,
): Promise<CitaFormState> {
  const user = await getAuthedUser();

  const parsed = citaSchema.safeParse({
    titulo: formData.get("titulo"),
    descripcion: formData.get("descripcion"),
    categoria: formData.get("categoria"),
    ubicacion: formData.get("ubicacion") ?? "",
    inicio_en: formData.get("inicio_en"),
    fin_en: formData.get("fin_en"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();

  let imagenUrl: string | null = null;
  const imagenFile = formData.get("imagen");
  if (imagenFile instanceof File && imagenFile.size > 0) {
    const uploaded = await uploadCitaImage(supabase, user.id, imagenFile);
    if (uploaded.error) return { error: uploaded.error };
    imagenUrl = uploaded.url ?? null;
  }

  const { data, error } = await supabase
    .from("citas")
    .insert({
      titulo: parsed.data.titulo,
      descripcion: parsed.data.descripcion ?? null,
      categoria: parsed.data.categoria,
      ubicacion: parsed.data.ubicacion,
      inicio_en: parsed.data.inicio_en,
      fin_en: parsed.data.fin_en,
      imagen_url: imagenUrl,
      estado: "propuesta",
      creado_por: user.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "No se ha podido guardar la cita." };
  }

  await notifyCitaPropuesta({
    citaId: data.id,
    titulo: parsed.data.titulo,
    authorId: user.id,
  });

  revalidateCitas(data.id);
  redirect(`/citas/${data.id}`);
}

export async function updateCita(
  citaId: string,
  _prevState: CitaFormState,
  formData: FormData,
): Promise<CitaFormState> {
  const user = await getAuthedUser();

  const parsed = citaSchema.safeParse({
    titulo: formData.get("titulo"),
    descripcion: formData.get("descripcion"),
    categoria: formData.get("categoria"),
    ubicacion: formData.get("ubicacion") ?? "",
    inicio_en: formData.get("inicio_en"),
    fin_en: formData.get("fin_en"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();

  const updates: {
    titulo: string;
    descripcion: string | null;
    categoria: string;
    ubicacion: string;
    inicio_en: string;
    fin_en: string;
    imagen_url?: string | null;
    recuerdo_url?: string | null;
    actualizado_en: string;
  } = {
    titulo: parsed.data.titulo,
    descripcion: parsed.data.descripcion ?? null,
    categoria: parsed.data.categoria,
    ubicacion: parsed.data.ubicacion,
    inicio_en: parsed.data.inicio_en,
    fin_en: parsed.data.fin_en,
    actualizado_en: new Date().toISOString(),
  };

  const pathsToRemove: string[] = [];
  const marker = "/citas/";

  const { data: current } = await supabase
    .from("citas")
    .select("imagen_url, recuerdo_url")
    .eq("id", citaId)
    .maybeSingle();

  const imagenFile = formData.get("imagen");
  const quitarImagen = formData.get("quitar_imagen") === "si";
  if (imagenFile instanceof File && imagenFile.size > 0) {
    const uploaded = await uploadCitaImage(supabase, user.id, imagenFile);
    if (uploaded.error) return { error: uploaded.error };
    updates.imagen_url = uploaded.url;

    const oldUrl = current?.imagen_url;
    const markerIndex = oldUrl?.indexOf(marker) ?? -1;
    if (oldUrl && markerIndex !== -1) {
      pathsToRemove.push(oldUrl.slice(markerIndex + marker.length));
    }
  } else if (quitarImagen && current?.imagen_url) {
    updates.imagen_url = null;
    const markerIndex = current.imagen_url.indexOf(marker);
    if (markerIndex !== -1) {
      pathsToRemove.push(current.imagen_url.slice(markerIndex + marker.length));
    }
  }

  const recuerdoFile = formData.get("recuerdo");
  const quitarRecuerdo = formData.get("quitar_recuerdo") === "si";
  if (recuerdoFile instanceof File && recuerdoFile.size > 0) {
    const uploaded = await uploadCitaImage(supabase, user.id, recuerdoFile);
    if (uploaded.error) return { error: uploaded.error };
    updates.recuerdo_url = uploaded.url;

    const oldUrl = current?.recuerdo_url;
    const markerIndex = oldUrl?.indexOf(marker) ?? -1;
    if (oldUrl && markerIndex !== -1) {
      pathsToRemove.push(oldUrl.slice(markerIndex + marker.length));
    }
  } else if (quitarRecuerdo && current?.recuerdo_url) {
    updates.recuerdo_url = null;
    const markerIndex = current.recuerdo_url.indexOf(marker);
    if (markerIndex !== -1) {
      pathsToRemove.push(
        current.recuerdo_url.slice(markerIndex + marker.length),
      );
    }
  }

  const { error } = await supabase.from("citas").update(updates).eq("id", citaId);

  if (error) {
    return { error: "No se ha podido actualizar la cita." };
  }

  if (pathsToRemove.length > 0) {
    await supabase.storage.from("citas").remove(pathsToRemove);
  }

  revalidateCitas(citaId);
  redirect(`/citas/${citaId}`);
}

export async function acceptCita(citaId: string) {
  const user = await getAuthedUser();
  const supabase = await createClient();

  const { data: cita, error: loadError } = await supabase
    .from("citas")
    .select("id, titulo, estado, creado_por")
    .eq("id", citaId)
    .maybeSingle();

  if (loadError || !cita) {
    throw new Error("No se ha encontrado la cita.");
  }
  if (cita.estado !== "propuesta") {
    throw new Error("Solo se pueden aceptar citas propuestas.");
  }
  if (cita.creado_por === user.id) {
    throw new Error("No puedes aceptar tu propia propuesta.");
  }

  const { error } = await supabase
    .from("citas")
    .update({
      estado: "programada",
      aprobado_por: user.id,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", citaId);

  if (error) throw new Error("No se ha podido aceptar la cita.");

  await notifyCitaAceptada({
    citaId,
    titulo: cita.titulo,
    proposerId: cita.creado_por,
    accepterId: user.id,
  });

  revalidateCitas(citaId);
}

export async function rejectCita(citaId: string) {
  const user = await getAuthedUser();
  const supabase = await createClient();

  const { data: cita, error: loadError } = await supabase
    .from("citas")
    .select("id, estado, creado_por")
    .eq("id", citaId)
    .maybeSingle();

  if (loadError || !cita) {
    throw new Error("No se ha encontrado la cita.");
  }
  if (cita.estado !== "propuesta") {
    throw new Error("Solo se pueden rechazar citas propuestas.");
  }
  if (cita.creado_por === user.id) {
    throw new Error("No puedes rechazar tu propia propuesta.");
  }

  const { error } = await supabase
    .from("citas")
    .update({
      estado: "rechazada",
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", citaId);

  if (error) throw new Error("No se ha podido rechazar la cita.");

  revalidateCitas(citaId);
  redirect("/citas/lista");
}

export async function markCitaFinalizada(citaId: string) {
  await getAuthedUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("citas")
    .update({
      estado: "finalizada",
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", citaId)
    .in("estado", ["propuesta", "programada"]);

  if (error) throw new Error("No se ha podido marcar la cita como finalizada.");

  revalidateCitas(citaId);
}

export async function deleteCita(citaId: string) {
  await getAuthedUser();
  const supabase = await createClient();

  const { data: current } = await supabase
    .from("citas")
    .select("imagen_url, recuerdo_url")
    .eq("id", citaId)
    .maybeSingle();

  const { error } = await supabase.from("citas").delete().eq("id", citaId);
  if (error) throw new Error("No se ha podido borrar la cita.");

  const marker = "/citas/";
  const paths: string[] = [];
  for (const oldUrl of [current?.imagen_url, current?.recuerdo_url]) {
    const markerIndex = oldUrl?.indexOf(marker) ?? -1;
    if (oldUrl && markerIndex !== -1) {
      paths.push(oldUrl.slice(markerIndex + marker.length));
    }
  }
  if (paths.length > 0) {
    await supabase.storage.from("citas").remove(paths);
  }

  revalidateCitas();
  redirect("/citas/lista");
}
