"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/dal";
import { inferPaisCode } from "@/lib/countdown-meta";
import {
  countdownRemindersSchema,
  countdownTripSchema,
} from "@/lib/countdown-validations";

export interface CountdownFormState {
  error?: string;
}

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function revalidateCountdown(id?: string) {
  revalidatePath("/cuenta-atras");
  revalidatePath("/cuenta-atras/nuevo");
  if (id) {
    revalidatePath(`/cuenta-atras/${id}`);
    revalidatePath(`/cuenta-atras/${id}/editar`);
  }
}

async function uploadCover(
  supabase: SupabaseServerClient,
  userId: string,
  file: File,
): Promise<{ url?: string; error?: string }> {
  if (file.size > 5 * 1024 * 1024) {
    return { error: "La imagen no puede superar los 5 MB." };
  }
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("cuenta-atras").upload(path, file);
  if (error) return { error: "No se ha podido subir la imagen." };
  return {
    url: supabase.storage.from("cuenta-atras").getPublicUrl(path).data.publicUrl,
  };
}

function parseTripForm(formData: FormData) {
  return countdownTripSchema.safeParse({
    nombre: formData.get("nombre"),
    destino: formData.get("destino") ?? "",
    pais_code: formData.get("pais_code"),
    inicio_fecha: formData.get("inicio_fecha"),
    inicio_hora: formData.get("inicio_hora"),
    fin_fecha: formData.get("fin_fecha"),
    emoji: formData.get("emoji"),
    nota: formData.get("nota"),
    imagen_url_existente: formData.get("imagen_url_existente"),
  });
}

export async function createCountdownTrip(
  _prev: CountdownFormState,
  formData: FormData,
): Promise<CountdownFormState> {
  const user = await getAuthedUser();
  const parsed = parseTripForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();
  let imagenUrl = parsed.data.imagen_url_existente;
  const file = formData.get("imagen");
  if (file instanceof File && file.size > 0) {
    const uploaded = await uploadCover(supabase, user.id, file);
    if (uploaded.error) return { error: uploaded.error };
    imagenUrl = uploaded.url ?? null;
  }

  const pais =
    parsed.data.pais_code ||
    inferPaisCode(parsed.data.destino, parsed.data.nombre);

  const { data, error } = await supabase
    .from("countdown_trips")
    .insert({
      nombre: parsed.data.nombre,
      destino: parsed.data.destino,
      pais_code: pais,
      inicio_fecha: parsed.data.inicio_fecha,
      inicio_hora: parsed.data.inicio_hora,
      fin_fecha: parsed.data.fin_fecha,
      emoji: parsed.data.emoji,
      nota: parsed.data.nota,
      imagen_url: imagenUrl,
      creado_por: user.id,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "No se ha podido guardar el viaje." };
  revalidateCountdown(data.id);
  redirect(`/cuenta-atras/${data.id}`);
}

export async function updateCountdownTrip(
  _prev: CountdownFormState,
  formData: FormData,
): Promise<CountdownFormState> {
  await getAuthedUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Viaje no válido." };

  const parsed = parseTripForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();
  const { data: current } = await supabase
    .from("countdown_trips")
    .select("imagen_url")
    .eq("id", id)
    .maybeSingle();

  let imagenUrl: string | null | undefined;
  const quitar = formData.get("quitar_imagen") === "si";
  const file = formData.get("imagen");
  if (file instanceof File && file.size > 0) {
    const user = await getAuthedUser();
    const uploaded = await uploadCover(supabase, user.id, file);
    if (uploaded.error) return { error: uploaded.error };
    imagenUrl = uploaded.url;
  } else if (parsed.data.imagen_url_existente) {
    imagenUrl = parsed.data.imagen_url_existente;
  } else if (quitar) {
    imagenUrl = null;
  }

  const pais =
    parsed.data.pais_code ||
    inferPaisCode(parsed.data.destino, parsed.data.nombre);

  const { error } = await supabase
    .from("countdown_trips")
    .update({
      nombre: parsed.data.nombre,
      destino: parsed.data.destino,
      pais_code: pais,
      inicio_fecha: parsed.data.inicio_fecha,
      inicio_hora: parsed.data.inicio_hora,
      fin_fecha: parsed.data.fin_fecha,
      emoji: parsed.data.emoji,
      nota: parsed.data.nota,
      ...(imagenUrl !== undefined ? { imagen_url: imagenUrl } : {}),
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: "No se ha podido actualizar el viaje." };

  if (
    imagenUrl !== undefined &&
    current?.imagen_url &&
    imagenUrl !== current.imagen_url
  ) {
    const marker = "/cuenta-atras/";
    const idx = current.imagen_url.indexOf(marker);
    if (idx !== -1) {
      await supabase.storage
        .from("cuenta-atras")
        .remove([current.imagen_url.slice(idx + marker.length)]);
    }
  }

  revalidateCountdown(id);
  redirect(`/cuenta-atras/${id}`);
}

export async function deleteCountdownTrip(id: string) {
  await getAuthedUser();
  const supabase = await createClient();
  const { data: current } = await supabase
    .from("countdown_trips")
    .select("imagen_url")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("countdown_trips").delete().eq("id", id);
  if (error) throw new Error("No se ha podido eliminar el viaje.");

  if (current?.imagen_url) {
    const marker = "/cuenta-atras/";
    const idx = current.imagen_url.indexOf(marker);
    if (idx !== -1) {
      await supabase.storage
        .from("cuenta-atras")
        .remove([current.imagen_url.slice(idx + marker.length)]);
    }
  }

  revalidateCountdown();
  redirect("/cuenta-atras");
}

export async function saveCountdownReminders(
  _prev: CountdownFormState,
  formData: FormData,
): Promise<CountdownFormState> {
  const user = await getAuthedUser();
  const tripId = String(formData.get("trip_id") ?? "");
  if (!tripId) return { error: "Viaje no válido." };

  const parsed = countdownRemindersSchema.safeParse({
    remind_30d: formData.get("remind_30d") === "on",
    remind_7d: formData.get("remind_7d") === "on",
    remind_1d: formData.get("remind_1d") === "on",
    remind_hoy: formData.get("remind_hoy") === "on",
  });
  if (!parsed.success) {
    return { error: "Recordatorios no válidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("countdown_trip_reminders").upsert(
    {
      trip_id: tripId,
      user_id: user.id,
      ...parsed.data,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: "trip_id,user_id" },
  );
  if (error) return { error: "No se han podido guardar los avisos." };

  revalidateCountdown(tripId);
  return {};
}
