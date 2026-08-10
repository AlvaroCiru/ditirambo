import type { Profile, Review } from "@/lib/types";
import { UserAvatar } from "@/components/profile/user-avatar";
import { DeleteReviewButton } from "@/components/works/delete-review-button";

export function ReviewList({
  workId,
  reviews,
  profiles,
}: {
  workId: string;
  reviews: Review[];
  profiles: Profile[];
}) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay reseñas.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {reviews.map((review) => {
        const author = profiles.find((p) => p.id === review.user_id);
        const recommendedTo = review.recomendado_para
          ? profiles.find((p) => p.id === review.recomendado_para)
          : null;

        return (
          <div
            key={review.id}
            className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2 font-medium">
                <UserAvatar
                  displayName={author?.display_name ?? "?"}
                  avatarUrl={author?.avatar_url ?? null}
                  size="sm"
                />
                <span className="truncate">
                  {author?.display_name ?? "Desconocido"}
                </span>
              </span>
              <div className="flex shrink-0 items-center gap-1">
                {review.nota != null && (
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-sm font-semibold text-secondary-foreground">
                    {review.nota}/10
                  </span>
                )}
                <DeleteReviewButton workId={workId} reviewId={review.id} />
              </div>
            </div>
            {review.texto && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {review.texto}
              </p>
            )}
            {recommendedTo && (
              <p className="text-xs text-muted-foreground">
                Recomendado a {recommendedTo.display_name}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
