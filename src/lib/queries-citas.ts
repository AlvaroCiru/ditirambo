import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Cita, CitaCategoria, CitaEstado } from "@/lib/types";

const CITA_SELECT =
  "id, titulo, descripcion, categoria, ubicacion, inicio_en, fin_en, imagen_url, recuerdo_url, pais_code, emoji, estado, creado_por, aprobado_por, creado_en, actualizado_en";

async function finalizePastCitas(supabase: Awaited<ReturnType<typeof createClient>>) {
  const now = new Date().toISOString();
  await supabase
    .from("citas")
    .update({
      estado: "finalizada",
      actualizado_en: now,
    })
    .in("estado", ["propuesta", "programada"])
    .lt("fin_en", now);
}

export async function getCitas(filters?: {
  estado?: CitaEstado;
  categoria?: CitaCategoria;
}): Promise<Cita[]> {
  const supabase = await createClient();
  await finalizePastCitas(supabase);

  let query = supabase
    .from("citas")
    .select(CITA_SELECT)
    .order("inicio_en", { ascending: true });

  if (filters?.estado) {
    query = query.eq("estado", filters.estado);
  } else {
    query = query.neq("estado", "rechazada");
  }

  if (filters?.categoria) {
    query = query.eq("categoria", filters.categoria);
  }

  const { data, error } = await query;
  if (error) throw new Error("No se han podido cargar las citas.");
  return (data ?? []) as Cita[];
}

export async function getCitasForCalendar(range: {
  from: string;
  to: string;
}): Promise<Cita[]> {
  const supabase = await createClient();
  await finalizePastCitas(supabase);

  const { data, error } = await supabase
    .from("citas")
    .select(CITA_SELECT)
    .in("estado", ["propuesta", "programada", "finalizada"])
    .lte("inicio_en", range.to)
    .gte("fin_en", range.from)
    .order("inicio_en", { ascending: true });

  if (error) throw new Error("No se han podido cargar las citas del calendario.");
  return (data ?? []) as Cita[];
}

export async function getCita(id: string): Promise<Cita | null> {
  const supabase = await createClient();
  await finalizePastCitas(supabase);

  const { data, error } = await supabase
    .from("citas")
    .select(CITA_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("No se ha podido cargar la cita.");
  return (data as Cita | null) ?? null;
}
