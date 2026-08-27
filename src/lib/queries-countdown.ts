import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/dal";
import {
  daysUntil,
  inferPaisCode,
} from "@/lib/countdown-meta";
import type {
  Cita,
  CountdownTrip,
  CountdownTripReminder,
} from "@/lib/types";

const TRIP_SELECT =
  "id, nombre, destino, pais_code, inicio_fecha, inicio_hora, fin_fecha, emoji, nota, imagen_url, creado_por, creado_en, actualizado_en";

const CITA_VIAJE_SELECT =
  "id, titulo, descripcion, categoria, ubicacion, inicio_en, fin_en, imagen_url, recuerdo_url, pais_code, emoji, estado, creado_por, aprobado_por, creado_en, actualizado_en";

export type CountdownItemSource = "cita" | "trip";

/** Vista unificada para tarjetas de Cuenta atrás. */
export interface CountdownItem {
  id: string;
  source: CountdownItemSource;
  nombre: string;
  destino: string;
  pais_code: string | null;
  inicio_fecha: string;
  inicio_hora: string | null;
  fin_fecha: string | null;
  emoji: string | null;
  nota: string | null;
  imagen_url: string | null;
  creado_en: string;
  /** Enlace a ficha (cita o viaje suelto). */
  href: string;
  /** Solo los viajes sueltos se editan desde Cuenta atrás. */
  editable: boolean;
}

function madridDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function madridTime(iso: string): string | null {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const hour = parts.find((p) => p.type === "hour")?.value;
  const minute = parts.find((p) => p.type === "minute")?.value;
  if (!hour || !minute) return null;
  return `${hour}:${minute}`;
}

function normalizeHora(hora: string | null): string | null {
  if (!hora) return null;
  return hora.slice(0, 5);
}

function normalizeTrip(row: CountdownTrip): CountdownTrip {
  return { ...row, inicio_hora: normalizeHora(row.inicio_hora) };
}

function citaToItem(cita: Cita): CountdownItem {
  const inicioFecha = madridDate(cita.inicio_en);
  const finFecha = madridDate(cita.fin_en);
  const pais =
    cita.pais_code ||
    inferPaisCode(cita.ubicacion, cita.titulo);

  return {
    id: `cita:${cita.id}`,
    source: "cita",
    nombre: cita.titulo,
    destino: cita.ubicacion,
    pais_code: pais,
    inicio_fecha: inicioFecha,
    inicio_hora: madridTime(cita.inicio_en),
    fin_fecha: finFecha === inicioFecha ? null : finFecha,
    emoji: cita.emoji,
    nota: cita.descripcion,
    imagen_url: cita.imagen_url ?? cita.recuerdo_url,
    creado_en: cita.creado_en,
    href: `/citas/${cita.id}`,
    editable: false,
  };
}

function tripToItem(trip: CountdownTrip): CountdownItem {
  return {
    id: `trip:${trip.id}`,
    source: "trip",
    nombre: trip.nombre,
    destino: trip.destino,
    pais_code: trip.pais_code,
    inicio_fecha: trip.inicio_fecha,
    inicio_hora: trip.inicio_hora,
    fin_fecha: trip.fin_fecha,
    emoji: trip.emoji,
    nota: trip.nota,
    imagen_url: trip.imagen_url,
    creado_en: trip.creado_en,
    href: `/cuenta-atras/${trip.id}`,
    editable: true,
  };
}

async function getStandaloneTrips(): Promise<CountdownTrip[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("countdown_trips")
    .select(TRIP_SELECT)
    .order("inicio_fecha", { ascending: true });
  if (error) throw new Error("No se han podido cargar los viajes.");
  return ((data ?? []) as CountdownTrip[]).map(normalizeTrip);
}

async function getViajeCitas(): Promise<Cita[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("citas")
    .select(CITA_VIAJE_SELECT)
    .eq("categoria", "viajes")
    .neq("estado", "rechazada")
    .order("inicio_en", { ascending: true });
  if (error) throw new Error("No se han podido cargar las citas de viaje.");
  return (data ?? []) as Cita[];
}

export async function getCountdownItems(): Promise<CountdownItem[]> {
  const [trips, citas] = await Promise.all([
    getStandaloneTrips(),
    getViajeCitas(),
  ]);
  const items = [
    ...citas.map(citaToItem),
    ...trips.map(tripToItem),
  ];
  items.sort((a, b) => a.inicio_fecha.localeCompare(b.inicio_fecha));
  return items;
}

export async function getUpcomingCountdownItems(): Promise<CountdownItem[]> {
  const all = await getCountdownItems();
  return all.filter((t) => daysUntil(t.inicio_fecha) >= 0);
}

export async function getPastCountdownItems(): Promise<CountdownItem[]> {
  const all = await getCountdownItems();
  return all
    .filter((t) => daysUntil(t.inicio_fecha) < 0)
    .sort((a, b) => b.inicio_fecha.localeCompare(a.inicio_fecha));
}

export async function getCountdownTrip(id: string): Promise<CountdownTrip | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("countdown_trips")
    .select(TRIP_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("No se ha podido cargar el viaje.");
  if (!data) return null;
  return normalizeTrip(data as CountdownTrip);
}

export async function getUsedCountdownImages(): Promise<string[]> {
  const items = await getCountdownItems();
  const urls = items
    .map((t) => t.imagen_url)
    .filter((u): u is string => Boolean(u));
  return [...new Set(urls)];
}

export async function getMyTripReminders(
  tripId: string,
): Promise<CountdownTripReminder | null> {
  const user = await getAuthedUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("countdown_trip_reminders")
    .select(
      "id, trip_id, user_id, remind_30d, remind_7d, remind_1d, remind_hoy, actualizado_en",
    )
    .eq("trip_id", tripId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error("No se han podido cargar los recordatorios.");
  return (data as CountdownTripReminder | null) ?? null;
}

/** @deprecated usar getUpcomingCountdownItems */
export async function getUpcomingTrips(): Promise<CountdownTrip[]> {
  return getStandaloneTrips().then((t) =>
    t.filter((x) => daysUntil(x.inicio_fecha) >= 0),
  );
}

/** @deprecated */
export async function getPastTrips(): Promise<CountdownTrip[]> {
  return getStandaloneTrips().then((t) =>
    t
      .filter((x) => daysUntil(x.inicio_fecha) < 0)
      .sort((a, b) => b.inicio_fecha.localeCompare(a.inicio_fecha)),
  );
}

/** @deprecated */
export async function getCountdownTrips(): Promise<CountdownTrip[]> {
  return getStandaloneTrips();
}
