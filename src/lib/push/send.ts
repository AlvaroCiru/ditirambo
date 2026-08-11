import "server-only";

import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getVapidPrivateKey,
  getVapidPublicKey,
  getVapidSubject,
  isAvisosWebEnabled,
} from "@/lib/push/config";

export interface AvisoPayload {
  title: string;
  body: string;
  url?: string;
}

function configureWebPush() {
  const subject = getVapidSubject();
  const publicKey = getVapidPublicKey();
  const privateKey = getVapidPrivateKey();
  if (!subject || !publicKey || !privateKey) return;
  webpush.setVapidDetails(subject, publicKey, privateKey);
}

/** Envía el mismo aviso a varios usuarios (p. ej. ambos perfiles). */
export async function sendAvisosToUsers(
  userIds: string[],
  payload: AvisoPayload,
): Promise<void> {
  const unique = [...new Set(userIds.filter(Boolean))];
  await Promise.all(unique.map((id) => sendAvisosToUser(id, payload)));
}

/** Envío best-effort: nunca lanza al llamador de negocio. */
export async function sendAvisosToUser(
  userId: string,
  payload: AvisoPayload,
): Promise<void> {
  if (!isAvisosWebEnabled()) return;

  try {
    configureWebPush();
    const admin = createAdminClient();
    const { data: rows, error } = await admin
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", userId);

    if (error || !rows?.length) return;

    const body = JSON.stringify({
      title: payload.title,
      body: payload.body,
      url: payload.url ?? "/resenas",
    });

    await Promise.all(
      rows.map(async (row) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: row.endpoint,
              keys: { p256dh: row.p256dh, auth: row.auth },
            },
            body,
          );
        } catch (err: unknown) {
          const statusCode =
            typeof err === "object" &&
            err &&
            "statusCode" in err &&
            typeof (err as { statusCode: unknown }).statusCode === "number"
              ? (err as { statusCode: number }).statusCode
              : null;

          // Suscripción caducada o inválida
          if (statusCode === 404 || statusCode === 410) {
            await admin.from("push_subscriptions").delete().eq("id", row.id);
          }
        }
      }),
    );
  } catch {
    // Silencio deliberado: los avisos no deben romper reseñas ni perfil.
  }
}
