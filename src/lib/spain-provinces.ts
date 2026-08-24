/** Nombres canónicos del GeoJSON `spain-provinces.geojson` (click_that_hood). */
export const SPAIN_PROVINCE_NAMES = [
  "A Coruña",
  "Alacant/Alicante",
  "Albacete",
  "Almería",
  "Araba/Álava",
  "Asturias",
  "Badajoz",
  "Barcelona",
  "Bizkaia/Vizcaya",
  "Burgos",
  "Cantabria",
  "Castelló/Castellón",
  "Ceuta",
  "Ciudad Real",
  "Cuenca",
  "Cáceres",
  "Cádiz",
  "Córdoba",
  "Gipuzkoa/Guipúzcoa",
  "Girona",
  "Granada",
  "Guadalajara",
  "Huelva",
  "Huesca",
  "Illes Balears",
  "Jaén",
  "La Rioja",
  "Las Palmas",
  "León",
  "Lleida",
  "Lugo",
  "Madrid",
  "Melilla",
  "Murcia",
  "Málaga",
  "Navarra",
  "Ourense",
  "Palencia",
  "Pontevedra",
  "Salamanca",
  "Santa Cruz De Tenerife",
  "Segovia",
  "Sevilla",
  "Soria",
  "Tarragona",
  "Teruel",
  "Toledo",
  "Valladolid",
  "València/Valencia",
  "Zamora",
  "Zaragoza",
  "Ávila",
] as const;

export type SpainProvinceName = (typeof SPAIN_PROVINCE_NAMES)[number];

function stripDiacritics(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

function fold(value: string): string {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9/]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Alias comunes (Nominatim, español/inglés) → nombre canónico del GeoJSON. */
const ALIAS_TO_CANONICAL = new Map<string, SpainProvinceName>();

function registerAlias(alias: string, canonical: SpainProvinceName) {
  ALIAS_TO_CANONICAL.set(fold(alias), canonical);
}

for (const name of SPAIN_PROVINCE_NAMES) {
  registerAlias(name, name);
  for (const part of name.split("/")) {
    registerAlias(part, name);
  }
}

const EXTRA_ALIASES: Array<[string, SpainProvinceName]> = [
  ["Community of Madrid", "Madrid"],
  ["Comunidad de Madrid", "Madrid"],
  ["Madrid Province", "Madrid"],
  ["Provincia de Madrid", "Madrid"],
  ["Barcelona Province", "Barcelona"],
  ["Provincia de Barcelona", "Barcelona"],
  ["Valencian Community", "València/Valencia"],
  ["Comunidad Valenciana", "València/Valencia"],
  ["Valencia", "València/Valencia"],
  ["Alicante", "Alacant/Alicante"],
  ["Castellón", "Castelló/Castellón"],
  ["Castello", "Castelló/Castellón"],
  ["Balearic Islands", "Illes Balears"],
  ["Islas Baleares", "Illes Balears"],
  ["Baleares", "Illes Balears"],
  ["Mallorca", "Illes Balears"],
  ["Vizcaya", "Bizkaia/Vizcaya"],
  ["Biscay", "Bizkaia/Vizcaya"],
  ["Guipúzcoa", "Gipuzkoa/Guipúzcoa"],
  ["Guipuzcoa", "Gipuzkoa/Guipúzcoa"],
  ["Álava", "Araba/Álava"],
  ["Alava", "Araba/Álava"],
  ["La Coruña", "A Coruña"],
  ["Coruña", "A Coruña"],
  ["A Coruna", "A Coruña"],
  ["Orense", "Ourense"],
  ["Lérida", "Lleida"],
  ["Gerona", "Girona"],
  ["Santa Cruz de Tenerife", "Santa Cruz De Tenerife"],
  ["Tenerife", "Santa Cruz De Tenerife"],
  ["Principado de Asturias", "Asturias"],
  ["Asturias Province", "Asturias"],
  ["Region of Murcia", "Murcia"],
  ["Región de Murcia", "Murcia"],
  ["Andalusia", "Sevilla"], // no: too broad — skip Andalusia as alias
  ["Navarre", "Navarra"],
  ["Nafarroa", "Navarra"],
  ["Catalonia", "Barcelona"], // too broad — skip
];

for (const [alias, canonical] of EXTRA_ALIASES) {
  // Skip overly broad aliases that were commented conceptually
  if (alias === "Andalusia" || alias === "Catalonia") continue;
  registerAlias(alias, canonical);
}

export function normalizeSpainProvince(
  raw: string | null | undefined,
): SpainProvinceName | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const direct = ALIAS_TO_CANONICAL.get(fold(trimmed));
  if (direct) return direct;

  // "Province of X" / "Provincia de X"
  const stripped = trimmed
    .replace(/^(provincia|province|community|comunidad|region|región)\s+(de|of)\s+/i, "")
    .replace(/\s+(province|provincia)$/i, "")
    .trim();
  if (stripped !== trimmed) {
    const again = ALIAS_TO_CANONICAL.get(fold(stripped));
    if (again) return again;
  }

  // Contención suave: "Madrid" dentro de texto más largo
  for (const name of SPAIN_PROVINCE_NAMES) {
    const foldedName = fold(name);
    const foldedRaw = fold(trimmed);
    if (foldedRaw === foldedName) return name;
    for (const part of name.split("/")) {
      if (fold(part) === foldedRaw) return name;
    }
  }

  return null;
}

/** Ray casting point-in-polygon (lon/lat). */
export function pointInRing(
  lng: number,
  lat: number,
  ring: number[][],
): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]![0]!;
    const yi = ring[i]![1]!;
    const xj = ring[j]![0]!;
    const yj = ring[j]![1]!;
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function pointInPolygonCoords(
  lng: number,
  lat: number,
  coords: number[][][] | number[][][][],
  type: "Polygon" | "MultiPolygon",
): boolean {
  if (type === "Polygon") {
    const rings = coords as number[][][];
    const outer = rings[0];
    if (!outer || !pointInRing(lng, lat, outer)) return false;
    for (let i = 1; i < rings.length; i++) {
      if (pointInRing(lng, lat, rings[i]!)) return false;
    }
    return true;
  }

  const polys = coords as number[][][][];
  return polys.some((poly) => pointInPolygonCoords(lng, lat, poly, "Polygon"));
}

export type ProvinceFeatureProps = {
  name?: string;
  NOM_PROV?: string;
};

export function provinceNameFromFeature(
  props: ProvinceFeatureProps | null | undefined,
): string {
  return props?.name || props?.NOM_PROV || "";
}

/**
 * Asigna provincia canónica a un punto usando features GeoJSON ya cargadas.
 */
export function resolveProvinceForPoint(
  lat: number,
  lng: number,
  features: Array<{
    properties?: ProvinceFeatureProps | null;
    geometry?: {
      type: string;
      coordinates: number[][][] | number[][][][];
    } | null;
  }>,
): SpainProvinceName | null {
  for (const feature of features) {
    const geom = feature.geometry;
    if (!geom) continue;
    if (geom.type !== "Polygon" && geom.type !== "MultiPolygon") continue;
    if (
      pointInPolygonCoords(
        lng,
        lat,
        geom.coordinates,
        geom.type as "Polygon" | "MultiPolygon",
      )
    ) {
      const raw = provinceNameFromFeature(feature.properties);
      return normalizeSpainProvince(raw) ?? (raw ? (raw as SpainProvinceName) : null);
    }
  }
  return null;
}
