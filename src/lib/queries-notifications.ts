import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/dal";
import type { NotificationTemplate } from "@/lib/types";

const COLUMNS =
  "id, key, label, description, title_template, body_template, enabled, url_default, variables, creado_en, actualizado_en" as const;

export async function getNotificationTemplates(): Promise<
  NotificationTemplate[]
> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("notification_templates")
    .select(COLUMNS)
    .order("label", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((row) => ({
    ...row,
    variables: row.variables ?? [],
  })) as NotificationTemplate[];
}
