/** Nota real: 0.5–10 en medios puntos. Las 5 estrellas son solo visuales. */
export const RATING_MIN = 0.5;
export const RATING_MAX = 10;
export const RATING_STEP = 0.5;
export const STAR_COUNT = 5;

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

/** "8" o "7.5" (sin ceros sobrantes). */
export function formatRating(value: number | null | undefined): string {
  const n = parseRating(value);
  if (n == null) return "";
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

/** Porcentaje de relleno de 5 estrellas a partir de una nota /10. */
export function ratingFillPercent(value: number | null | undefined): number {
  const n = parseRating(value);
  if (n == null) return 0;
  return Math.min(100, Math.max(0, (n / RATING_MAX) * 100));
}
