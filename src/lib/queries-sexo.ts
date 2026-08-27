import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  comunidadFromProvincia,
  DEFAULT_HOME,
  distanceKm,
} from "@/lib/sexo-meta";
import { normalizeSpainProvince } from "@/lib/spain-provinces";
import type {
  SexoLugar,
  SexoLugarTipo,
  SexoSettings,
} from "@/lib/types";

const LUGAR_SELECT =
  "id, nombre, tipo, ubicacion_texto, lat, lng, pais_code, provincia, ciudad, comunidad_autonoma, fecha_primera, nota, imagen_url, estado, creado_por, creado_en, actualizado_en";

export type SexoLugarSort = "recientes" | "antiguos" | "nombre";

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

function normalizeLugar(row: SexoLugar): SexoLugar {
  const provincia =
    normalizeSpainProvince(row.provincia) ?? row.provincia;
  return {
    ...row,
    provincia,
    comunidad_autonoma:
      row.comunidad_autonoma || comunidadFromProvincia(provincia),
    fecha_primera: row.fecha_primera,
  };
}

export async function getSexoLugares(filters?: {
  tipo?: SexoLugarTipo;
  sort?: SexoLugarSort;
  q?: string;
}): Promise<SexoLugar[]> {
  const supabase = await createClient();
  let query = supabase.from("sexo_lugares").select(LUGAR_SELECT);

  if (filters?.tipo) query = query.eq("tipo", filters.tipo);

  const sort = filters?.sort ?? "recientes";
  if (sort === "nombre") {
    query = query.order("nombre", { ascending: true });
  } else if (sort === "antiguos") {
    query = query.order("fecha_primera", { ascending: true });
  } else {
    query = query.order("fecha_primera", { ascending: false });
  }

  const { data: lugares, error } = await query;
  if (error) throw new Error("No se han podido cargar los lugares.");

  let rows = ((lugares ?? []) as SexoLugar[]).map(normalizeLugar);

  const q = filters?.q?.trim().toLowerCase();
  if (q) {
    rows = rows.filter((l) => {
      const haystack = [
        l.nombre,
        l.ciudad,
        l.provincia,
        l.comunidad_autonoma,
        l.pais_code,
        l.ubicacion_texto,
        l.nota,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  return rows;
}

export async function getSexoLugar(id: string): Promise<SexoLugar | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sexo_lugares")
    .select(LUGAR_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("No se ha podido cargar el lugar.");
  if (!data) return null;
  return normalizeLugar(data as SexoLugar);
}

export async function findSexoLugarDuplicates(
  nombre: string,
  ciudad?: string | null,
  excludeId?: string,
): Promise<SexoLugar[]> {
  const all = await getSexoLugares({ sort: "nombre" });
  const nameFold = nombre.trim().toLowerCase();
  const cityFold = ciudad?.trim().toLowerCase() ?? "";
  return all.filter((l) => {
    if (excludeId && l.id === excludeId) return false;
    const sameName = l.nombre.trim().toLowerCase() === nameFold;
    if (!sameName) return false;
    if (!cityFold) return true;
    const lCity = (l.ciudad ?? "").trim().toLowerCase();
    return !lCity || lCity === cityFold;
  });
}

export interface SexoCuriosidades {
  lugares: number;
  ciudades: number;
  provincias: number;
  comunidades: number;
  paises: number;
  primeraFecha: string | null;
  primeraProvincia: string | null;
  primeraComunidadFueraMadrid: string | null;
  primerPaisExtranjero: string | null;
  ultimaProvinciaNueva: string | null;
  ultimoPaisNuevo: string | null;
  masLejos: { nombre: string; km: number; ubicacion: string } | null;
}

export async function getSexoCuriosidades(): Promise<SexoCuriosidades> {
  const [settings, lugares] = await Promise.all([
    getSexoSettings(),
    getSexoLugares({ sort: "antiguos" }),
  ]);

  const ciudades = new Set(
    lugares.map((l) => l.ciudad).filter((c): c is string => Boolean(c)),
  );
  const provincias = new Set(
    lugares.map((l) => l.provincia).filter((p): p is string => Boolean(p)),
  );
  const comunidades = new Set(
    lugares
      .map((l) => l.comunidad_autonoma)
      .filter((c): c is string => Boolean(c)),
  );
  const paises = new Set(
    lugares.map((l) => l.pais_code?.toUpperCase()).filter((p): p is string => Boolean(p)),
  );

  const primeraProvincia =
    lugares.find((l) => Boolean(l.provincia))?.provincia ?? null;

  const primeraComunidadFueraMadrid =
    lugares.find((l) => {
      const ccaa = l.comunidad_autonoma;
      if (!ccaa) return false;
      return !/madrid/i.test(ccaa);
    })?.comunidad_autonoma ?? null;

  const primerExtranjero = lugares.find(
    (l) => l.pais_code && l.pais_code.toUpperCase() !== "ES",
  );

  // Última provincia / país nuevos: recorrer en orden cronológico y quedarse con la última novedad
  const seenProv = new Set<string>();
  const seenPais = new Set<string>();
  let ultimaProvinciaNueva: string | null = null;
  let ultimoPaisNuevo: string | null = null;
  for (const l of lugares) {
    if (l.provincia && !seenProv.has(l.provincia)) {
      seenProv.add(l.provincia);
      ultimaProvinciaNueva = l.provincia;
    }
    const pais = l.pais_code?.toUpperCase();
    if (pais && !seenPais.has(pais)) {
      seenPais.add(pais);
      ultimoPaisNuevo = pais;
    }
  }

  let masLejos: SexoCuriosidades["masLejos"] = null;
  for (const l of lugares) {
    if (l.lat == null || l.lng == null) continue;
    const km = distanceKm(settings.casa_lat, settings.casa_lng, l.lat, l.lng);
    if (!masLejos || km > masLejos.km) {
      masLejos = {
        nombre: l.nombre,
        km: Math.round(km),
        ubicacion: [l.ciudad, l.provincia, l.pais_code]
          .filter(Boolean)
          .join(", "),
      };
    }
  }

  return {
    lugares: lugares.length,
    ciudades: ciudades.size,
    provincias: provincias.size,
    comunidades: comunidades.size,
    paises: paises.size,
    primeraFecha: lugares[0]?.fecha_primera ?? null,
    primeraProvincia,
    primeraComunidadFueraMadrid,
    primerPaisExtranjero: primerExtranjero
      ? [primerExtranjero.ciudad, primerExtranjero.pais_code]
          .filter(Boolean)
          .join(", ") || primerExtranjero.nombre
      : null,
    ultimaProvinciaNueva,
    ultimoPaisNuevo,
    masLejos,
  };
}
