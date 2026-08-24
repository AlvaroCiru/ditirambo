import type { SexoLugarTipo } from "@/lib/types";

/** Punto medio Sanchinarro ↔ La Moraleja (Madrid). */
export const DEFAULT_HOME = {
  lat: 40.502,
  lng: -3.647,
} as const;

export const SEXO_TIPO_ORDER: SexoLugarTipo[] = [
  "hotel",
  "casa",
  "exterior",
  "coche",
  "otros",
];

export const SEXO_TIPO_LABELS: Record<SexoLugarTipo, string> = {
  hotel: "Hoteles",
  casa: "Casas",
  exterior: "Exterior",
  coche: "Coche",
  otros: "Otros",
};

export const SEXO_TIPO_LABEL_SINGULAR: Record<SexoLugarTipo, string> = {
  hotel: "Hotel",
  casa: "Casa",
  exterior: "Exterior",
  coche: "Coche",
  otros: "Otros",
};

/** Distancia en km (haversine). */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatFechaCorta(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatFechaTimeline(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(d)
    .toUpperCase();
}
