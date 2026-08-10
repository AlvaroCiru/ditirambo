import Link from "next/link";
import { UserAvatar } from "@/components/profile/user-avatar";
import type { PendingRecommendation } from "@/lib/queries";
import type { Profile } from "@/lib/types";

export function PendingRecommendations({
  items,
  profiles,
}: {
  items: PendingRecommendation[];
  profiles: Profile[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-xl">Recomendaciones pendientes</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(({ work, fromReview }) => {
          const from = profiles.find((p) => p.id === fromReview.user_id);

          return (
            <Link
              key={work.id}
              href={`/reseñas/obras/${work.id}`}
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
              <div className="flex min-w-0 flex-col">
                <span className="font-heading line-clamp-2 text-base leading-snug break-words">
                  {work.titulo}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  Te lo recomendó {from?.display_name ?? "tu pareja"}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
