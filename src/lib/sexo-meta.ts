import type { SexoLugarTipo } from "@/lib/types";
import {
  normalizeSpainProvince,
  type SpainProvinceName,
} from "@/lib/spain-provinces";

/** Punto medio Sanchinarro ↔ La Moraleja (Madrid). */
export const DEFAULT_HOME = {
  lat: 40.502,
  lng: -3.647,
} as const;

export const SEXO_TIPO_ORDER: SexoLugarTipo[] = [
  "casa",
  "hotel",
  "apartamento",
  "exterior",
  "coche",
  "otros",
];

export const SEXO_TIPO_LABELS: Record<SexoLugarTipo, string> = {
  hotel: "Hoteles",
  casa: "Casas",
  apartamento: "Apartamentos",
  exterior: "Exterior",
  coche: "Coche",
  otros: "Otros",
};

export const SEXO_TIPO_LABEL_SINGULAR: Record<SexoLugarTipo, string> = {
  hotel: "Hotel",
  casa: "Casa",
  apartamento: "Apartamento / alojamiento",
  exterior: "Exterior",
  coche: "Coche",
  otros: "Otro",
};

/** Provincia canónica → comunidad autónoma. */
const PROVINCE_TO_CCAA: Record<SpainProvinceName, string> = {
  "A Coruña": "Galicia",
  "Alacant/Alicante": "Comunidad Valenciana",
  Albacete: "Castilla-La Mancha",
  Almería: "Andalucía",
  "Araba/Álava": "País Vasco",
  Asturias: "Asturias",
  Badajoz: "Extremadura",
  Barcelona: "Cataluña",
  "Bizkaia/Vizcaya": "País Vasco",
  Burgos: "Castilla y León",
  Cantabria: "Cantabria",
  "Castelló/Castellón": "Comunidad Valenciana",
  Ceuta: "Ceuta",
  "Ciudad Real": "Castilla-La Mancha",
  Cuenca: "Castilla-La Mancha",
  Cáceres: "Extremadura",
  Cádiz: "Andalucía",
  Córdoba: "Andalucía",
  "Gipuzkoa/Guipúzcoa": "País Vasco",
  Girona: "Cataluña",
  Granada: "Andalucía",
  Guadalajara: "Castilla-La Mancha",
  Huelva: "Andalucía",
  Huesca: "Aragón",
  "Illes Balears": "Illes Balears",
  Jaén: "Andalucía",
  "La Rioja": "La Rioja",
  "Las Palmas": "Canarias",
  León: "Castilla y León",
  Lleida: "Cataluña",
  Lugo: "Galicia",
  Madrid: "Comunidad de Madrid",
  Melilla: "Melilla",
  Murcia: "Región de Murcia",
  Málaga: "Andalucía",
  Navarra: "Navarra",
  Ourense: "Galicia",
  Palencia: "Castilla y León",
  Pontevedra: "Galicia",
  Salamanca: "Castilla y León",
  "Santa Cruz De Tenerife": "Canarias",
  Segovia: "Castilla y León",
  Sevilla: "Andalucía",
  Soria: "Castilla y León",
  Tarragona: "Cataluña",
  Teruel: "Aragón",
  Toledo: "Castilla-La Mancha",
  Valladolid: "Castilla y León",
  "València/Valencia": "Comunidad Valenciana",
  Zamora: "Castilla y León",
  Zaragoza: "Aragón",
  Ávila: "Castilla y León",
};

export function comunidadFromProvincia(
  provincia: string | null | undefined,
): string | null {
  const canonical = normalizeSpainProvince(provincia);
  if (!canonical) return null;
  return PROVINCE_TO_CCAA[canonical] ?? null;
}

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
  })
    .format(d)
    .toUpperCase();
}

export function formatMesAnio(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
  })
    .format(d)
    .toUpperCase();
}

export function formatLocalizacion(lugar: {
  ciudad?: string | null;
  provincia?: string | null;
  comunidad_autonoma?: string | null;
  pais_code?: string | null;
  ubicacion_texto?: string | null;
}): string {
  const parts = [lugar.ciudad, lugar.provincia, lugar.pais_code]
    .filter(Boolean)
    .join(" · ");
  return parts || lugar.ubicacion_texto || "Sin ubicación";
}
