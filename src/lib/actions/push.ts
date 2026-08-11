"use server";

import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/dal";
import {
  getAvisosConfigIssue,
  getVapidPublicKey,
  isAvisosWebEnabled,
  type AvisosConfigIssue,
} from "@/lib/push/config";
import { sendTemplatedAviso } from "@/lib/push/templates";

export interface PushSettingsState {
  enabled: boolean;
  configured: boolean;
  vapidPublicKey: string | null;
  hasSubscription: boolean;
  issue: AvisosConfigIssue;
}

export async function getPushSettings(): Promise<PushSettingsState> {
  const user = await getAuthedUser();
  const issue = getAvisosConfigIssue();
  const configured = issue === null;
  const vapidPublicKey = getVapidPublicKey();

  if (!configured) {
    return {
      enabled: false,
      configured: false,
      vapidPublicKey: null,
      hasSubscription: false,
      issue,
    };
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("push_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return {
    enabled: true,
    configured: true,
    vapidPublicKey,
    hasSubscription: (count ?? 0) > 0,
    issue: null,
  };
}

export async function savePushSubscription(input: {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}): Promise<{ error?: string }> {
  if (!isAvisosWebEnabled()) {
    return { error: "Los avisos no están activos en este entorno." };
  }

  const user = await getAuthedUser();
  const supabase = await createClient();

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      user_agent: input.userAgent ?? null,
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    return { error: "No se ha podido guardar la suscripción a avisos." };
  }

  return {};
}

export async function removePushSubscription(
  endpoint?: string,
): Promise<{ error?: string }> {
  const user = await getAuthedUser();
  const supabase = await createClient();

  let query = supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id);

  if (endpoint) {
    query = query.eq("endpoint", endpoint);
  }

  const { error } = await query;
  if (error) {
    return { error: "No se ha podido desactivar los avisos." };
  }
  return {};
}

export async function sendTestAviso(): Promise<{ error?: string }> {
  if (!isAvisosWebEnabled()) {
    return { error: "Los avisos no están activos en este entorno." };
  }

  const user = await getAuthedUser();
  await sendTemplatedAviso({
    key: "push_test",
    userIds: [user.id],
  });
  return {};
}
