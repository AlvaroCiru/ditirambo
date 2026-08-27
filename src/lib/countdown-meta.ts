/** Utilidades de cuenta atrás (Europe/Madrid). */

const TZ = "Europe/Madrid";

export function todayMadridIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Días desde hoy (Madrid) hasta fecha YYYY-MM-DD. 0 = hoy, negativo = pasado. */
export function daysUntil(isoDate: string): number {
  const today = todayMadridIso();
  const t0 = Date.parse(`${today}T12:00:00Z`);
  const t1 = Date.parse(`${isoDate}T12:00:00Z`);
  if (Number.isNaN(t0) || Number.isNaN(t1)) return 0;
  return Math.round((t1 - t0) / 86_400_000);
}

export function formatTripDateRange(
  inicio: string,
  fin?: string | null,
): string {
  const start = new Date(`${inicio}T12:00:00`);
  if (Number.isNaN(start.getTime())) return inicio;

  if (!fin || fin === inicio) {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(start);
  }

  const end = new Date(`${fin}T12:00:00`);
  if (Number.isNaN(end.getTime())) {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(start);
  }

  const sameMonth =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    const dayStart = start.getDate();
    const rest = new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(end);
    return `${dayStart}–${rest}`;
  }

  if (sameYear) {
    const left = new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
    }).format(start);
    const right = new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(end);
    return `${left} – ${right}`;
  }

  const left = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(start);
  const right = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(end);
  return `${left} – ${right}`;
}

/** ISO 3166-1 alpha-2 → emoji bandera. */
export function flagEmojiFromCountryCode(code: string | null | undefined): string {
  if (!code || code.length !== 2) return "";
  const cc = code.toUpperCase();
  if (!/^[A-Z]{2}$/.test(cc)) return "";
  const A = 0x1f1e6;
  return String.fromCodePoint(
    A + (cc.charCodeAt(0) - 65),
    A + (cc.charCodeAt(1) - 65),
  );
}

/** Inferencia simple de código país a partir del destino (ES, RS, etc.). */
const DESTINO_PAIS: Array<[RegExp, string]> = [
  [/\bserbia\b/i, "RS"],
  [/\bcogolludo\b|\bespaña\b|\bespana\b|\bmadrid\b|\bbarcelona\b|\btoledo\b|\bcáceres\b|\bcaceres\b|\bávila\b|\bavila\b|\bextremadura\b/i, "ES"],
  [/\bpolonia\b|\bpoland\b|\bvarsovia\b|\bkrak[oó]w\b/i, "PL"],
  [/\bcarolina del norte\b|\bnorth carolina\b|\besta[dt]os unidos\b|\busa\b|\bee\.?\s*uu\.?/i, "US"],
  [/\bfrancia\b|\bparis\b|\bparís\b/i, "FR"],
  [/\bitalia\b|\brom[ae]\b|\bflorencia\b|\bvene[cz]ia\b/i, "IT"],
  [/\bportugal\b|\blisboa\b|\boporto\b/i, "PT"],
  [/\bale[mn]ania\b|\bberlin\b|\bm[uü]nich\b/i, "DE"],
  [/\breino unido\b|\blondres\b|\binglaterra\b/i, "GB"],
  [/\bgrecia\b|\batenas\b/i, "GR"],
  [/\bcroacia\b|\bdubrovnik\b/i, "HR"],
  [/\bjap[oó]n\b|\btokio\b|\bkyoto\b/i, "JP"],
  [/\bm[eé]xico\b/i, "MX"],
  [/\bargentina\b|\bbuenos aires\b/i, "AR"],
  [/\bmarruecos\b|\bmorocco\b/i, "MA"],
];

export function inferPaisCode(
  destino: string | null | undefined,
  nombre?: string | null,
): string | null {
  const haystack = `${destino ?? ""} ${nombre ?? ""}`.trim();
  if (!haystack) return null;
  for (const [re, code] of DESTINO_PAIS) {
    if (re.test(haystack)) return code;
  }
  return null;
}

export function countdownLabel(days: number): { primary: string; secondary?: string } {
  if (days === 0) return { primary: "HOY", secondary: "✈️" };
  if (days === 1) return { primary: "1", secondary: "día" };
  if (days > 1) return { primary: String(days), secondary: "días" };
  return { primary: String(Math.abs(days)), secondary: "días atrás" };
}

/** Progreso 0–1 entre creado y salida (clamp). */
export function tripProgress(creadoEn: string, inicioFecha: string): number {
  const createdDay = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(creadoEn));
  const start = Date.parse(`${createdDay}T12:00:00Z`);
  const end = Date.parse(`${inicioFecha}T12:00:00Z`);
  const now = Date.parse(`${todayMadridIso()}T12:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 1;
  return Math.min(1, Math.max(0, (now - start) / (end - start)));
}

export function detailedCountdown(
  inicioFecha: string,
  inicioHora: string | null,
): { days: number; hours: number; minutes: number } | null {
  if (!inicioHora) return null;
  const target = new Date(`${inicioFecha}T${inicioHora}:00`);
  // Interpret as Madrid local by composing offset approx via formatter — use ISO with offset if possible.
  // Simpler: treat as local browser; for shared app both in Madrid is fine.
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0 };
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  return { days, hours, minutes };
}
