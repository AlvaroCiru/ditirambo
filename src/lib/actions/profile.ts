"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuthedUser } from "@/lib/dal";
import { usernameToEmail } from "@/lib/username";

const profileSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(1, "El nombre no puede estar vacío.")
    .max(60),
  username: z
    .string()
    .trim()
    .min(2, "El nombre de usuario es demasiado corto.")
    .max(40),
});

export interface ProfileFormState {
  error?: string;
  success?: boolean;
}

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const user = await getAuthedUser();

  const parsed = profileSchema.safeParse({
    display_name: formData.get("display_name"),
    username: formData.get("username"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();

  let avatarUrl: string | undefined;
  let previousAvatarPath: string | undefined;
  const avatarFile = formData.get("avatar");

  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (avatarFile.size > 5 * 1024 * 1024) {
      return { error: "La imagen no puede superar los 5 MB." };
    }

    // Sin upsert: en Postgres, "insert ... on conflict do update" exige
    // también satisfacer la política de UPDATE, que en una primera subida
    // no puede cumplirse (no hay owner_id todavía) y rechaza la subida.
    // Con un nombre nuevo cada vez evitamos ese conflicto.
    const ext = avatarFile.name.split(".").pop() ?? "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile);

    if (uploadError) {
      return { error: "No se ha podido subir la foto." };
    }

    avatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data
      .publicUrl;

    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    const marker = "/avatars/";
    const oldUrl = currentProfile?.avatar_url;
    const markerIndex = oldUrl?.indexOf(marker) ?? -1;
    if (oldUrl && markerIndex !== -1) {
      previousAvatarPath = oldUrl.slice(markerIndex + marker.length);
    }
  }

  const newEmail = usernameToEmail(parsed.data.username);
  if (newEmail !== user.email) {
    const admin = createAdminClient();
    const { error: emailError } = await admin.auth.admin.updateUserById(
      user.id,
      { email: newEmail, email_confirm: true },
    );

    if (emailError) {
      if (emailError.code === "email_exists") {
        return { error: "Ese nombre de usuario ya está en uso." };
      }
      return {
        error: "No se ha podido actualizar el nombre de usuario.",
      };
    }
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq("id", user.id);

  if (profileError) {
    return { error: "No se ha podido actualizar el perfil." };
  }

  if (previousAvatarPath) {
    await supabase.storage.from("avatars").remove([previousAvatarPath]);
  }

  revalidatePath("/", "layout");
  return { success: true };
}
