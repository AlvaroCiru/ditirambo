"use client";

import { useActionState } from "react";
import { upsertReview, type ReviewFormState } from "@/lib/actions/reviews";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StarRatingInput } from "@/components/works/star-rating";
import type { Review } from "@/lib/types";

const initialState: ReviewFormState = {};

export function ReviewForm({
  workId,
  partnerId,
  existingReview,
}: {
  workId: string;
  partnerId: string | null;
  existingReview: Review | null;
}) {
  const boundAction = upsertReview.bind(null, workId, partnerId);
  const [state, formAction, pending] = useActionState(
    boundAction,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="nota">Nota</Label>
        <StarRatingInput
          id="nota"
          name="nota"
          defaultValue={existingReview?.nota}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="recomendado"
              value="si"
              defaultChecked={Boolean(existingReview?.recomendado_para)}
              disabled={!partnerId}
              className="size-4 accent-primary"
            />
            Recomendar a mi pareja
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="para_compartir"
              value="si"
              defaultChecked={Boolean(existingReview?.para_compartir)}
              className="size-4 accent-primary"
            />
            Para compartir
          </label>
        </div>
        {!partnerId && (
          <p className="text-xs text-muted-foreground">
            La recomendación se activará cuando exista la cuenta de tu pareja.
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Recomendación: para el otro. Para compartir: ver o hacer juntos.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="texto">Reseña</Label>
        <Textarea
          id="texto"
          name="texto"
          rows={4}
          defaultValue={existingReview?.texto ?? undefined}
        />
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-muted-foreground">Guardado.</p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending
          ? "Guardando…"
          : existingReview
            ? "Actualizar reseña"
            : "Publicar reseña"}
      </Button>
    </form>
  );
}
