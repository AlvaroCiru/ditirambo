/** Nombres de país a partir de código ISO 3166-1 alpha-2. */

const displayNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["es"], { type: "region" })
    : null;

/** «ES» → «España». Si no hay nombre, devuelve el código. */
export function countryNameFromCode(
  code: string | null | undefined,
): string {
  const cc = (code ?? "").trim().toUpperCase();
  if (!cc || cc.length !== 2) return code?.trim() || "";
  try {
    const name = displayNames?.of(cc);
    if (name && name !== cc) return name;
  } catch {
    /* código desconocido */
  }
  return cc;
}
