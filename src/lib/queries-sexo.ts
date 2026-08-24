import "server-only";

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_HOME, distanceKm } from "@/lib/sexo-meta";
import type {
  SexoEncuentroConLugar,
  SexoLugar,
  SexoLugarConStats,
  SexoLugarTipo,
  SexoSettings,
  SexoSugerencia,
} from "@/lib/types";

const LUGAR_SELECT =
  "id, nombre, tipo, ubicacion_texto, lat, lng, pais_code, provincia, ciudad, imagen_url, estado, creado_por, creado_en, actualizado_en";

const ENCUENTRO_SELECT =
  "id, lugar_id, fecha, titulo, notas, imagen_url, creado_por, creado_en, actualizado_en";

export async function getSexoSettings(): Promise<SexoSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sexo_settings")
    .select("id, clave, casa_lat, casa_lng, actualizado_en")
    .eq("clave", "default")
    .maybeSingle();

  if (error) throw new Error("No se han podido cargar los ajustes.");
  if (data) return data as SexoSettings;

  return {
    id: "",
    clave: "default",
    casa_lat: DEFAULT_HOME.lat,
    casa_lng: DEFAULT_HOME.lng,
    actualizado_en: new Date().toISOString(),
  };
}

export async function getSexoLugares(filters?: {
  tipo?: SexoLugarTipo;
  estado?: "visitado" | "pendiente";
}): Promise<SexoLugarConStats[]> {
  const supabase = await createClient();
  let query = supabase.from("sexo_lugares").select(LUGAR_SELECT).order("nombre");

  if (filters?.tipo) query = query.eq("tipo", filters.tipo);
  if (filters?.estado) query = query.eq("estado", filters.estado);

  const { data: lugares, error } = await query;
  if (error) throw new Error("No se han podido cargar los lugares.");

  const { data: encuentros, error: encError } = await supabase
    .from("sexo_encuentros")
    .select("lugar_id, fecha");
  if (encError) throw new Error("No se han podido cargar los encuentros.");

  const byLugar = new Map<string, { count: number; ultima: string | null }>();
  for (const e of encuentros ?? []) {
    const prev = byLugar.get(e.lugar_id) ?? { count: 0, ultima: null };
    prev.count += 1;
    if (!prev.ultima || e.fecha > prev.ultima) prev.ultima = e.fecha;
    byLugar.set(e.lugar_id, prev);
  }

  return ((lugares ?? []) as SexoLugar[]).map((lugar) => {
    const stats = byLugar.get(lugar.id);
    return {
      ...lugar,
      encuentros_count: stats?.count ?? 0,
      ultima_fecha: stats?.ultima ?? null,
    };
  });
}

export async function getSexoLugar(id: string): Promise<SexoLugar | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sexo_lugares")
    .select(LUGAR_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("No se ha podido cargar el lugar.");
  return (data as SexoLugar | null) ?? null;
}

export async function getSexoEncuentros(limit?: number): Promise<SexoEncuentroConLugar[]> {
  const supabase = await createClient();
  let query = supabase
    .from("sexo_encuentros")
    .select(
      `${ENCUENTRO_SELECT}, lugar:sexo_lugares!lugar_id (${LUGAR_SELECT})`,
    )
    .order("fecha", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw new Error("No se han podido cargar los encuentros.");

  type Row = {
    id: string;
    lugar_id: string;
    fecha: string;
    titulo: string;
    notas: string | null;
    imagen_url: string | null;
    creado_por: string;
    creado_en: string;
    actualizado_en: string;
    lugar: SexoLugar | SexoLugar[] | null;
  };

  return ((data ?? []) as unknown as Row[])
    .map((row) => {
      const lugar = Array.isArray(row.lugar) ? row.lugar[0] : row.lugar;
      if (!lugar) return null;
      return {
        id: row.id,
        lugar_id: row.lugar_id,
        fecha: row.fecha,
        titulo: row.titulo,
        notas: row.notas,
        imagen_url: row.imagen_url,
        creado_por: row.creado_por,
        creado_en: row.creado_en,
        actualizado_en: row.actualizado_en,
        lugar,
      } satisfies SexoEncuentroConLugar;
    })
    .filter((row): row is SexoEncuentroConLugar => row !== null);
}

export async function getSexoSugerencias(): Promise<SexoSugerencia[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sexo_sugerencias")
    .select(
      "id, titulo, notas, tipo, ubicacion_texto, lat, lng, imagen_url, estado, propuesto_por, creado_en, actualizado_en",
    )
    .order("creado_en", { ascending: false });

  if (error) throw new Error("No se han podido cargar las sugerencias.");
  return (data ?? []) as SexoSugerencia[];
}

export interface SexoCuriosidades {
  encuentros: number;
  lugares: number;
  ciudades: number;
  provincias: number;
  paises: number;
  porTipo: Record<SexoLugarTipo, number>;
  primeraFecha: string | null;
  ultimaFecha: string | null;
  lugarMasRepetido: { nombre: string; count: number } | null;
  provinciaMasRepetida: string | null;
  mesMasEncuentros: string | null;
  masLejos: { nombre: string; km: number; ubicacion: string } | null;
  primeraFueraEspana: string | null;
}

export async function getSexoCuriosidades(): Promise<SexoCuriosidades> {
  const [settings, lugares, encuentros] = await Promise.all([
    getSexoSettings(),
    getSexoLugares(),
    getSexoEncuentros(),
  ]);

  const visitados = lugares.filter((l) => l.estado === "visitado" || l.encuentros_count > 0);
  const porTipo: Record<SexoLugarTipo, number> = {
    hotel: 0,
    casa: 0,
    exterior: 0,
    coche: 0,
    otros: 0,
  };
  for (const l of visitados) porTipo[l.tipo] += 1;

  const ciudades = new Set(
    visitados.map((l) => l.ciudad).filter((c): c is string => Boolean(c)),
  );
  const provincias = new Set(
    visitados.map((l) => l.provincia).filter((p): p is string => Boolean(p)),
  );
  const paises = new Set(
    visitados.map((l) => l.pais_code).filter((p): p is string => Boolean(p)),
  );

  let lugarMasRepetido: SexoCuriosidades["lugarMasRepetido"] = null;
  for (const l of lugares) {
    if (l.encuentros_count <= 0) continue;
    if (!lugarMasRepetido || l.encuentros_count > lugarMasRepetido.count) {
      lugarMasRepetido = { nombre: l.nombre, count: l.encuentros_count };
    }
  }

  const provinciaCounts = new Map<string, number>();
  for (const e of encuentros) {
    const p = e.lugar.provincia;
    if (!p) continue;
    provinciaCounts.set(p, (provinciaCounts.get(p) ?? 0) + 1);
  }
  let provinciaMasRepetida: string | null = null;
  let maxProv = 0;
  for (const [p, n] of provinciaCounts) {
    if (n > maxProv) {
      maxProv = n;
      provinciaMasRepetida = p;
    }
  }

  const monthCounts = new Map<string, number>();
  for (const e of encuentros) {
    const key = e.fecha.slice(0, 7);
    monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1);
  }
  let mesMasEncuentros: string | null = null;
  let maxMes = 0;
  for (const [m, n] of monthCounts) {
    if (n > maxMes) {
      maxMes = n;
      mesMasEncuentros = m;
    }
  }

  let masLejos: SexoCuriosidades["masLejos"] = null;
  for (const l of visitados) {
    if (l.lat == null || l.lng == null) continue;
    const km = distanceKm(settings.casa_lat, settings.casa_lng, l.lat, l.lng);
    if (!masLejos || km > masLejos.km) {
      masLejos = {
        nombre: l.nombre,
        km: Math.round(km),
        ubicacion: [l.ciudad, l.provincia, l.pais_code].filter(Boolean).join(", "),
      };
    }
  }

  const fuera = encuentros
    .filter((e) => e.lugar.pais_code && e.lugar.pais_code.toUpperCase() !== "ES")
    .sort((a, b) => a.fecha.localeCompare(b.fecha))[0];

  const fechas = encuentros.map((e) => e.fecha).sort();

  return {
    encuentros: encuentros.length,
    lugares: visitados.length,
    ciudades: ciudades.size,
    provincias: provincias.size,
    paises: paises.size,
    porTipo,
    primeraFecha: fechas[0] ?? null,
    ultimaFecha: fechas[fechas.length - 1] ?? null,
    lugarMasRepetido,
    provinciaMasRepetida,
    mesMasEncuentros,
    masLejos,
    primeraFueraEspana: fuera
      ? [fuera.lugar.ciudad, fuera.lugar.pais_code].filter(Boolean).join(", ") ||
        fuera.lugar.nombre
      : null,
  };
}
