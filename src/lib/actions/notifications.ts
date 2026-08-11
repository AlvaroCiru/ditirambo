"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/dal";

export interface NotificationFormState {
  error?: string;
  success?: boolean;
}

const updateSchema = z.object({
  title_template: z
    .string()
    .trim()
    .min(1, "El título no puede estar vacío.")
    .max(120),
  body_template: z
    .string()
    .trim()
    .min(1, "El cuerpo no puede estar vacío.")
    .max(500),
  enabled: z.boolean(),
});

export async function updateNotificationTemplate(
  templateId: string,
  _prev: NotificationFormState,
  formData: FormData,
): Promise<NotificationFormState> {
  await requireAdmin();

  const parsed = updateSchema.safeParse({
    title_template: formData.get("title_template"),
    body_template: formData.get("body_template"),
    enabled: formData.get("enabled") === "si",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("notification_templates")
    .update({
      title_template: parsed.data.title_template,
      body_template: parsed.data.body_template,
      enabled: parsed.data.enabled,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", templateId);

  if (error) {
    return { error: "No se ha podido guardar la plantilla." };
  }

  revalidatePath("/avisos");
  return { success: true };
}

export async function setNotificationTemplateEnabled(
  templateId: string,
  enabled: boolean,
): Promise<{ error?: string }> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase
    .from("notification_templates")
    .update({
      enabled,
      actualizado_en: new Date().toISOString(),
    })
    .eq("id", templateId);

  if (error) {
    return { error: "No se ha podido actualizar el estado." };
  }

  revalidatePath("/avisos");
  return {};
}
