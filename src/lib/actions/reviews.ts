"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAuthedUser, getProfiles } from "@/lib/dal";
import { reviewSchema } from "@/lib/validations";
import { sendAvisosToUser } from "@/lib/push/send";
import { isAvisosWebEnabled } from "@/lib/push/config";

export interface ReviewFormState {
  error?: string;
  success?: boolean;
}

async function avisosTrasResena(options: {
  workId: string;
  authorId: string;
  partnerId: string | null;
  recomendado: boolean;
  paraCompartir: boolean;
}) {
  if (!isAvisosWebEnabled() || !options.partnerId) return;

  const supabase = await createClient();
  const [{ data: work }, profiles] = await Promise.all([
    supabase.from("works").select("titulo").eq("id", options.workId).maybeSingle(),
    getProfiles(),
  ]);

  const author = profiles.find((p) => p.id === options.authorId);
  const titulo = work?.titulo ?? "una obra";
  const nombre = author?.display_name ?? "Tu pareja";
  const url = `/resenas/obras/${options.workId}`;

  if (options.recomendado) {
    await sendAvisosToUser(options.partnerId, {
      title: "Nueva recomendación",
      body: `${nombre} te ha recomendado «${titulo}».`,
      url,
    });
    return;
  }

  if (options.paraCompartir) {
    await sendAvisosToUser(options.partnerId, {
      title: "Para compartir",
      body: `${nombre} ha marcado «${titulo}» para ver o hacer juntos.`,
      url,
    });
    return;
  }

  await sendAvisosToUser(options.partnerId, {
    title: "Nueva reseña",
    body: `${nombre} ha reseñado «${titulo}».`,
    url,
  });
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
    para_compartir: formData.get("para_compartir"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos no válidos." };
  }

  const supabase = await createClient();
  const recomendado = parsed.data.recomendado === "si";
  const paraCompartir = parsed.data.para_compartir === "si";
  const { error } = await supabase.from("reviews").upsert(
    {
      work_id: workId,
      user_id: user.id,
      nota: parsed.data.nota ?? null,
      texto: parsed.data.texto ?? null,
      recomendado_para: recomendado ? partnerId : null,
      para_compartir: paraCompartir,
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: "work_id,user_id" },
  );

  if (error) {
    return { error: "No se ha podido guardar la reseña." };
  }

  void avisosTrasResena({
    workId,
    authorId: user.id,
    partnerId,
    recomendado,
    paraCompartir,
  });

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
