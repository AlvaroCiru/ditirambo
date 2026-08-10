import Link from "next/link";
import { CategoryBadge } from "./category-badge";
import { UserAvatar } from "@/components/profile/user-avatar";
import type { FeedItem } from "@/lib/queries";
import type { Profile } from "@/lib/types";

export function ActivityItem({
  item,
  profiles,
}: {
  item: FeedItem;
  profiles: Profile[];
}) {
  const author = profiles.find((p) => p.id === item.review.user_id);
  const recommendedTo = item.review.recomendado_para
    ? profiles.find((p) => p.id === item.review.recomendado_para)
    : null;

  return (
    <Link
      href={`/reseñas/obras/${item.work.id}`}
      className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
      style={{
        borderLeftColor: `var(--category-${item.work.tipo})`,
        borderLeftWidth: 4,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <CategoryBadge tipo={item.work.tipo} />
        {item.review.nota != null && (
          <span className="text-sm font-semibold">{item.review.nota}/10</span>
        )}
      </div>
      <p className="flex min-w-0 items-center gap-2 text-sm">
        <UserAvatar
          displayName={author?.display_name ?? "?"}
          avatarUrl={author?.avatar_url ?? null}
          size="sm"
        />
        <span className="min-w-0">
          <span className="font-medium">
            {author?.display_name ?? "Alguien"}
          </span>{" "}
          reseñó{" "}
          <span className="font-heading break-words italic">
            {item.work.titulo}
          </span>
        </span>
      </p>
      {item.review.texto && (
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {item.review.texto}
        </p>
      )}
      {recommendedTo && (
        <p className="text-xs text-muted-foreground">
          Recomendado a {recommendedTo.display_name}
        </p>
      )}
    </Link>
  );
}
