"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/dal";
import { DEFAULT_HOME } from "@/lib/sexo-meta";
import { normalizeSpainProvince } from "@/lib/spain-provinces";
import {
  sexoCasaSchema,
  sexoEncuentroSchema,
  sexoLugarSchema,
  sexoSugerenciaSchema,
} from "@/lib/sexo-validations";

export interface SexoFormState {
  error?: string;
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function revalidateSexo(paths: string[] = []) {
  revalidatePath("/sexo");
  revalidatePath("/sexo/mapa");
  revalidatePath("/sexo/lugares");
  revalidatePath("/sexo/timeline");
  revalidatePath("/sexo/curiosidades");
  revalidatePath("/sexo/pendientes");
  revalidatePath("/sexo/ajustes");
  revalidatePath("/sexo/encuentro/nuevo");
  for (const p of paths) revalidatePath(p);
}

async function uploadSexoImage(
  supabase: SupabaseServerClient,
  userId: string,
  file: File,
): Promise<{ url?: string; error?: string }> {
  if (file.size > 5 * 1024 * 1024) {
    return { error: "La imagen no puede superar los 5 MB." };
  }
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("sexo").upload(path, file);
  if (error) return { error: "No se ha podido subir la imagen." };
  return {
    url: supabase.storage.from("sexo").getPublicUrl(path).data.publicUrl,
  };
}

export async function updateSexoCasa(
  _prev: SexoFormState,
  formData: FormData,
): Promise<SexoFormState> {
  await getAuthedUser();
  const parsed = sexoCasaSchema.safeParse({
    casa_lat: formData.get("casa_lat"),
    casa_lng: formData.get("casa_lng"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Coords no válidas." };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("sexo_settings")
    .select("id")
    .eq("clave", "default")
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("sexo_settings")
      .update({
        casa_lat: parsed.data.casa_lat,
        casa_lng: parsed.data.casa_lng,
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) return { error: "No se ha podido guardar la casa." };
  } else {
    const { error } = await supabase.from("sexo_settings").insert({
      clave: "default",
      casa_lat: parsed.data.casa_lat,
      casa_lng: parsed.data.casa_lng,
    });
    if (error) return { error: "No se ha podido guardar la casa." };
  }

  revalidateSexo();
  return {};
}

export async function resetSexoCasa(): Promise<void> {
  await getAuthedUser();
  const supabase = await createClient();
  await supabase
    .from("sexo_settings")
    .update({
      casa_lat: DEFAULT_HOME.lat,
      casa_lng: DEFAULT_HOME.lng,
      actualizado_en: new Date().toISOString(),
    })
    .eq("clave", "default");
  revalidateSexo();
}

export async function createSexoLugar(
  _prev: SexoFormState,
  formData: FormData,
): Promise<SexoFormState> {
  const user = await getAuthedUser();
  const parsed = sexoLugarSchema.safeParse({
    nombre: formData.get("nombre"),
    tipo: formData.get("tipo"),
    ubicacion_texto: formData.get("ubicacion_texto") ?? "",
    lat: formData.get("lat"),
    lng: formData.get("lng"),
    pais_code: formData.get("pais_code"),
    provincia: formData.get("provincia"),
    ciudad: formData.get("ciudad"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const lugarPayload = {
    ...parsed.data,
    provincia:
      normalizeSpainProvince(parsed.data.provincia) ?? parsed.data.provincia,
    pais_code: parsed.data.pais_code?.toUpperCase() ?? null,
  };

  const supabase = await createClient();
  let imagenUrl: string | null = null;
  const file = formData.get("imagen");
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadSexoImage(supabase, user.id, file);
    if (uploaded.error) return { error: uploaded.error };
    imagenUrl = uploaded.url ?? null;
  }

  const { data, error } = await supabase
    .from("sexo_lugares")
    .insert({
      ...lugarPayload,
      imagen_url: imagenUrl,
      estado: "pendiente",
      creado_por: user.id,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "No se ha podido guardar el lugar." };
  revalidateSexo([`/sexo/lugares/${data.id}`]);
  redirect(`/sexo/lugares/${data.id}`);
}

export async function createSexoEncuentro(
  _prev: SexoFormState,
  formData: FormData,
): Promise<SexoFormState> {
  const user = await getAuthedUser();
  const parsed = sexoEncuentroSchema.safeParse({
    lugar_id: formData.get("lugar_id"),
    fecha: formData.get("fecha"),
    titulo: formData.get("titulo"),
    notas: formData.get("notas"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();
  let imagenUrl: string | null = null;
  const file = formData.get("imagen");
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadSexoImage(supabase, user.id, file);
    if (uploaded.error) return { error: uploaded.error };
    imagenUrl = uploaded.url ?? null;
  }

  const { error } = await supabase.from("sexo_encuentros").insert({
    lugar_id: parsed.data.lugar_id,
    fecha: parsed.data.fecha,
    titulo: parsed.data.titulo,
    notas: parsed.data.notas ?? null,
    imagen_url: imagenUrl,
    creado_por: user.id,
  });
  if (error) return { error: "No se ha podido guardar el encuentro." };

  await supabase
    .from("sexo_lugares")
    .update({
      estado: "visitado",
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", parsed.data.lugar_id);

  revalidateSexo([`/sexo/lugares/${parsed.data.lugar_id}`]);
  redirect("/sexo/timeline");
}

export async function createSexoSugerencia(
  _prev: SexoFormState,
  formData: FormData,
): Promise<SexoFormState> {
  const user = await getAuthedUser();
  const parsed = sexoSugerenciaSchema.safeParse({
    titulo: formData.get("titulo"),
    notas: formData.get("notas"),
    tipo: formData.get("tipo"),
    ubicacion_texto: formData.get("ubicacion_texto") ?? "",
    lat: formData.get("lat"),
    lng: formData.get("lng"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();
  let imagenUrl: string | null = null;
  const file = formData.get("imagen");
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadSexoImage(supabase, user.id, file);
    if (uploaded.error) return { error: uploaded.error };
    imagenUrl = uploaded.url ?? null;
  }

  const { error } = await supabase.from("sexo_sugerencias").insert({
    ...parsed.data,
    imagen_url: imagenUrl,
    estado: "propuesta",
    propuesto_por: user.id,
  });
  if (error) return { error: "No se ha podido guardar la sugerencia." };

  revalidateSexo();
  redirect("/sexo/pendientes");
}

export async function acceptSexoSugerencia(id: string) {
  const user = await getAuthedUser();
  const supabase = await createClient();

  const { data: sug, error: loadError } = await supabase
    .from("sexo_sugerencias")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (loadError || !sug) throw new Error("Sugerencia no encontrada.");
  if (sug.estado !== "propuesta") throw new Error("Ya está resuelta.");
  if (sug.propuesto_por === user.id) {
    throw new Error("No puedes aceptar tu propia sugerencia.");
  }

  const { data: lugar, error: lugarError } = await supabase
    .from("sexo_lugares")
    .insert({
      nombre: sug.titulo,
      tipo: sug.tipo,
      ubicacion_texto: sug.ubicacion_texto,
      lat: sug.lat,
      lng: sug.lng,
      imagen_url: sug.imagen_url,
      estado: "pendiente",
      creado_por: user.id,
    })
    .select("id")
    .single();

  if (lugarError || !lugar) throw new Error("No se ha podido crear el lugar.");

  await supabase
    .from("sexo_sugerencias")
    .update({
      estado: "aceptada",
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", id);

  revalidateSexo([`/sexo/lugares/${lugar.id}`]);
}

export async function rejectSexoSugerencia(id: string) {
  const user = await getAuthedUser();
  const supabase = await createClient();

  const { data: sug } = await supabase
    .from("sexo_sugerencias")
    .select("propuesto_por, estado")
    .eq("id", id)
    .maybeSingle();

  if (!sug || sug.estado !== "propuesta") {
    throw new Error("Sugerencia no válida.");
  }
  if (sug.propuesto_por === user.id) {
    throw new Error("No puedes rechazar tu propia sugerencia.");
  }

  await supabase
    .from("sexo_sugerencias")
    .update({
      estado: "rechazada",
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", id);

  revalidateSexo();
}

export async function deleteSexoLugar(id: string) {
  await getAuthedUser();
  const supabase = await createClient();
  const { error } = await supabase.from("sexo_lugares").delete().eq("id", id);
  if (error) throw new Error("No se ha podido borrar el lugar.");
  revalidateSexo();
  redirect("/sexo/lugares");
}

export async function deleteSexoEncuentro(id: string) {
  await getAuthedUser();
  const supabase = await createClient();
  const { error } = await supabase.from("sexo_encuentros").delete().eq("id", id);
  if (error) throw new Error("No se ha podido borrar el encuentro.");
  revalidateSexo();
}
