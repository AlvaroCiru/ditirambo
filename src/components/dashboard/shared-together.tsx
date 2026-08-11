import Link from "next/link";
import { UserAvatar } from "@/components/profile/user-avatar";
import { StarRating } from "@/components/works/star-rating";
import type { SharedTogetherItem } from "@/lib/queries";
import type { Profile } from "@/lib/types";

export function SharedTogether({
  items,
  profiles,
}: {
  items: SharedTogetherItem[];
  profiles: Profile[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-xl">Para compartir</h2>
      <p className="text-sm text-muted-foreground">
        Cosas que queréis ver o hacer juntos.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(({ work, fromReview }) => {
          const from = profiles.find((p) => p.id === fromReview.user_id);

          return (
            <Link
              key={work.id}
              href={`/resenas/obras/${work.id}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
              style={{
                borderLeftColor: `var(--category-${work.tipo})`,
                borderLeftWidth: 4,
              }}
            >
              <UserAvatar
                displayName={from?.display_name ?? "?"}
                avatarUrl={from?.avatar_url ?? null}
                size="sm"
              />
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="font-heading line-clamp-2 text-base leading-snug break-words">
                  {work.titulo}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Marcado por {from?.display_name ?? "alguien"}
                </span>
                <StarRating value={fromReview.nota} size="sm" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
