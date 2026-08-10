/** Escala Letterboxd: 0.5–5 en pasos de medio punto. */
export const RATING_MIN = 0.5;
export const RATING_MAX = 5;
export const RATING_STEP = 0.5;

export function parseRating(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function isValidRating(value: number): boolean {
  if (value < RATING_MIN || value > RATING_MAX) return false;
  return Math.abs(value * 2 - Math.round(value * 2)) < 1e-9;
}

/** "4" o "3.5" (sin ceros sobrantes). */
export function formatRating(value: number | null | undefined): string {
  const n = parseRating(value);
  if (n == null) return "";
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/** Porcentaje de relleno de la barra de estrellas (0–100). */
export function ratingFillPercent(value: number | null | undefined): number {
  const n = parseRating(value);
  if (n == null) return 0;
  return Math.min(100, Math.max(0, (n / RATING_MAX) * 100));
}
