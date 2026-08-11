import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendAvisosToUsers } from "@/lib/push/send";
import type { NotificationTemplate } from "@/lib/types";

export function renderTemplate(
  template: string,
  vars: Record<string, string>,
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    return vars[key] ?? "";
  });
}

export async function getNotificationTemplate(
  key: string,
): Promise<NotificationTemplate | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("notification_templates")
    .select(
      "id, key, label, description, title_template, body_template, enabled, url_default, variables, creado_en, actualizado_en",
    )
    .eq("key", key)
    .maybeSingle();

  if (error || !data) return null;
  return {
    ...data,
    variables: data.variables ?? [],
  } as NotificationTemplate;
}

/** Envía un aviso usando la plantilla de BD. Si está desactivada o falta, no envía. */
export async function sendTemplatedAviso(options: {
  key: string;
  userIds: string[];
  vars?: Record<string, string>;
  url?: string;
}): Promise<void> {
  const template = await getNotificationTemplate(options.key);
  if (!template?.enabled) return;

  const vars = options.vars ?? {};
  await sendAvisosToUsers(options.userIds, {
    title: renderTemplate(template.title_template, vars),
    body: renderTemplate(template.body_template, vars),
    url: options.url ?? template.url_default,
  });
}
