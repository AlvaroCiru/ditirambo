import { normalizeSpainProvince } from "@/lib/spain-provinces";

export type GeocodeResult = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  ciudad: string | null;
  provincia: string | null;
  pais_code: string | null;
};

type NominatimItem = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    state_district?: string;
    province?: string;
    country_code?: string;
  };
};

function extractProvincia(a: NonNullable<NominatimItem["address"]>): string | null {
  const candidates = [a.province, a.county, a.state_district, a.state];
  for (const c of candidates) {
    const normalized = normalizeSpainProvince(c);
    if (normalized) return normalized;
  }
  for (const c of candidates) {
    if (c?.trim()) return c.trim();
  }
  return null;
}

export async function searchAddresses(
  query: string,
  signal?: AbortSignal,
): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");

  const res = await fetch(url.toString(), {
    signal,
    headers: {
      Accept: "application/json",
      // Política de Nominatim: identificar la app.
      "User-Agent": "Ditirambo/1.0 (private couple app)",
    },
  });

  if (!res.ok) {
    throw new Error("No se ha podido buscar la dirección.");
  }

  const data = (await res.json()) as NominatimItem[];
  return data.map((item) => {
    const a = item.address ?? {};
    return {
      id: String(item.place_id),
      label: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
      ciudad: a.city || a.town || a.village || a.municipality || null,
      provincia: extractProvincia(a),
      pais_code: a.country_code ? a.country_code.toUpperCase() : null,
    };
  });
}
