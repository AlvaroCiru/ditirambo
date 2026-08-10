function env(name: string): string {
  return (process.env[name] ?? "").trim().replace(/^["']|["']$/g, "");
}

function flagOn(value: string): boolean {
  const v = value.toLowerCase();
  return v === "1" || v === "true" || v === "on" || v === "yes" || v === "si";
}

function flagOff(value: string): boolean {
  const v = value.toLowerCase();
  return v === "0" || v === "false" || v === "off" || v === "no";
}

export type AvisosConfigIssue =
  | "flag_ausente"
  | "flag_apagado"
  | "falta_clave_publica"
  | "falta_clave_privada"
  | "falta_asunto"
  | null;

/** Diagnóstico sin exponer secretos (para Perfil). */
export function getAvisosConfigIssue(): AvisosConfigIssue {
  const flag = env("NEXT_PUBLIC_AVISOS_WEB");
  if (!flag) return "flag_ausente";
  if (flagOff(flag)) return "flag_apagado";
  if (!flagOn(flag)) return "flag_ausente";
  if (!env("NEXT_PUBLIC_VAPID_PUBLIC_KEY")) return "falta_clave_publica";
  if (!env("VAPID_PRIVATE_KEY")) return "falta_clave_privada";
  if (!env("VAPID_SUBJECT")) return "falta_asunto";
  return null;
}

/** Interruptor seguro: con 0/false/ausente, toda la capa de avisos queda inerte. */
export function isAvisosWebEnabled(): boolean {
  return getAvisosConfigIssue() === null;
}

export function getVapidPublicKey(): string | null {
  if (!isAvisosWebEnabled()) return null;
  return env("NEXT_PUBLIC_VAPID_PUBLIC_KEY") || null;
}

export function getVapidPrivateKey(): string | null {
  if (!isAvisosWebEnabled()) return null;
  return env("VAPID_PRIVATE_KEY") || null;
}

export function getVapidSubject(): string | null {
  if (!isAvisosWebEnabled()) return null;
  return env("VAPID_SUBJECT") || null;
}
