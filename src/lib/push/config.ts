/** Interruptor seguro: con 0/false/ausente, toda la capa de avisos queda inerte. */
export function isAvisosWebEnabled(): boolean {
  const flag = process.env.NEXT_PUBLIC_AVISOS_WEB;
  if (flag === "0" || flag === "false" || flag === "off") return false;
  if (flag !== "1" && flag !== "true" && flag !== "on") return false;

  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
      process.env.VAPID_PRIVATE_KEY &&
      process.env.VAPID_SUBJECT,
  );
}

export function getVapidPublicKey(): string | null {
  if (!isAvisosWebEnabled()) return null;
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null;
}
