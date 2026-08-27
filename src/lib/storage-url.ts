/** Validación de URLs públicas de Storage (usable en servidor y cliente). */

export function isOwnBucketPublicUrl(
  url: string,
  bucket: string,
  userId: string,
): boolean {
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
  if (!base || !url) return false;
  const prefix = `${base}/storage/v1/object/public/${bucket}/${userId}/`;
  return url.startsWith(prefix);
}
