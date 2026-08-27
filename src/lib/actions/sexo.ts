"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/dal";
import { comunidadFromProvincia, DEFAULT_HOME } from "@/lib/sexo-meta";
import { normalizeSpainProvince } from "@/lib/spain-provinces";
import { findSexoLugarDuplicates } from "@/lib/queries-sexo";
import { sexoCasaSchema, sexoLugarSchema } from "@/lib/sexo-validations";

export interface SexoFormState {
  error?: string;
  duplicates?: Array<{ id: string; nombre: string; ciudad: string | null }>;
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function revalidateSexo(paths: string[] = []) {
  revalidatePath("/sexo");
  revalidatePath("/sexo/mapa");
  revalidatePath("/sexo/lugares");
  revalidatePath("/sexo/timeline");
  revalidatePath("/sexo/curiosidades");
  revalidatePath("/sexo/ajustes");
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

function buildLugarPayload(parsed: ReturnType<typeof sexoLugarSchema.parse>) {
  const provincia =
    normalizeSpainProvince(parsed.provincia) ?? parsed.provincia;
  const comunidad =
    parsed.comunidad_autonoma || comunidadFromProvincia(provincia);
  return {
    nombre: parsed.nombre,
    tipo: parsed.tipo,
    fecha_primera: parsed.fecha_primera,
    ubicacion_texto: parsed.ubicacion_texto,
    lat: parsed.lat,
    lng: parsed.lng,
    ciudad: parsed.ciudad,
    provincia,
    comunidad_autonoma: comunidad,
    pais_code: parsed.pais_code?.toUpperCase() ?? null,
    nota: parsed.nota,
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
    fecha_primera: formData.get("fecha_primera"),
    ubicacion_texto: formData.get("ubicacion_texto") ?? "",
    lat: formData.get("lat"),
    lng: formData.get("lng"),
    pais_code: formData.get("pais_code"),
    provincia: formData.get("provincia"),
    ciudad: formData.get("ciudad"),
    comunidad_autonoma: formData.get("comunidad_autonoma"),
    nota: formData.get("nota"),
    confirmar_duplicado: formData.get("confirmar_duplicado"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  if (!parsed.data.confirmar_duplicado) {
    const dups = await findSexoLugarDuplicates(
      parsed.data.nombre,
      parsed.data.ciudad,
    );
    if (dups.length > 0) {
      return {
        error: "¿Este lugar ya existe?",
        duplicates: dups.map((d) => ({
          id: d.id,
          nombre: d.nombre,
          ciudad: d.ciudad,
        })),
      };
    }
  }

  const lugarPayload = buildLugarPayload(parsed.data);
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
      estado: "visitado",
      creado_por: user.id,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "No se ha podido guardar el lugar." };
  revalidateSexo([`/sexo/lugares/${data.id}`]);
  redirect(`/sexo/lugares/${data.id}`);
}

export async function updateSexoLugar(
  _prev: SexoFormState,
  formData: FormData,
): Promise<SexoFormState> {
  await getAuthedUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Lugar no válido." };

  const parsed = sexoLugarSchema.safeParse({
    nombre: formData.get("nombre"),
    tipo: formData.get("tipo"),
    fecha_primera: formData.get("fecha_primera"),
    ubicacion_texto: formData.get("ubicacion_texto") ?? "",
    lat: formData.get("lat"),
    lng: formData.get("lng"),
    pais_code: formData.get("pais_code"),
    provincia: formData.get("provincia"),
    ciudad: formData.get("ciudad"),
    comunidad_autonoma: formData.get("comunidad_autonoma"),
    nota: formData.get("nota"),
    confirmar_duplicado: "1",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const lugarPayload = buildLugarPayload(parsed.data);
  const supabase = await createClient();

  // Solo actualiza sexo_lugares; no modifica ni borra sexo_encuentros.
  let imagenUrl: string | undefined;
  const file = formData.get("imagen");
  if (file instanceof File && file.size > 0) {
    const user = await getAuthedUser();
    const uploaded = await uploadSexoImage(supabase, user.id, file);
    if (uploaded.error) return { error: uploaded.error };
    imagenUrl = uploaded.url;
  }

  const { error } = await supabase
    .from("sexo_lugares")
    .update({
      ...lugarPayload,
      ...(imagenUrl !== undefined ? { imagen_url: imagenUrl } : {}),
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: "No se ha podido actualizar el lugar." };
  revalidateSexo([`/sexo/lugares/${id}`]);
  redirect(`/sexo/lugares/${id}`);
}

export async function deleteSexoLugar(id: string) {
  await getAuthedUser();
  const supabase = await createClient();

  // Volcar textos de encuentros a nota antes del CASCADE (no DELETE directo
  // de sexo_encuentros). Así el lugar guarda el recuerdo completo hasta el
  // borrado explícito que pide la persona usuaria.
  const [{ data: encuentros }, { data: lugar }] = await Promise.all([
    supabase
      .from("sexo_encuentros")
      .select("titulo, notas, fecha")
      .eq("lugar_id", id)
      .order("fecha", { ascending: true }),
    supabase.from("sexo_lugares").select("nota").eq("id", id).maybeSingle(),
  ]);

  if (encuentros?.length) {
    let nota = (lugar?.nota as string | null)?.trim() ?? "";
    for (const e of encuentros) {
      const titulo = String(e.titulo ?? "").trim();
      const cuerpo = String(e.notas ?? "").trim();
      if (titulo && !nota.includes(titulo)) {
        nota = nota ? `${titulo}\n\n${nota}` : titulo;
      }
      if (cuerpo && !nota.includes(cuerpo.slice(0, Math.min(48, cuerpo.length)))) {
        nota = nota ? `${nota}\n\n${cuerpo}` : cuerpo;
      }
    }
    await supabase
      .from("sexo_lugares")
      .update({
        nota: nota || null,
        actualizado_en: new Date().toISOString(),
      })
      .eq("id", id);
  }

  const { error } = await supabase.from("sexo_lugares").delete().eq("id", id);
  if (error) throw new Error("No se ha podido borrar el lugar.");
  revalidateSexo();
  redirect("/sexo/lugares");
}
