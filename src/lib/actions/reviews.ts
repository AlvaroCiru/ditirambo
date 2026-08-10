"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser } from "@/lib/dal";
import { reviewSchema } from "@/lib/validations";

export interface ReviewFormState {
  error?: string;
  success?: boolean;
}

export async function upsertReview(
  workId: string,
  partnerId: string | null,
  _prevState: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const user = await getAuthedUser();

  const parsed = reviewSchema.safeParse({
    nota: formData.get("nota"),
    texto: formData.get("texto"),
    recomendado: formData.get("recomendado"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").upsert(
    {
      work_id: workId,
      user_id: user.id,
      nota: parsed.data.nota ?? null,
      texto: parsed.data.texto ?? null,
      recomendado_para:
        parsed.data.recomendado === "si" ? partnerId : null,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: "work_id,user_id" },
  );

  if (error) {
    return { error: "No se ha podido guardar la reseña." };
  }

  revalidatePath(`/resenas/obras/${workId}`);
  revalidatePath("/resenas");
  return { success: true };
}

export async function deleteReview(workId: string, reviewId: string) {
  await getAuthedUser();
  const supabase = await createClient();

  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

  if (error) throw new Error("No se ha podido borrar la reseña.");

  revalidatePath(`/resenas/obras/${workId}`);
  revalidatePath("/resenas");
}
