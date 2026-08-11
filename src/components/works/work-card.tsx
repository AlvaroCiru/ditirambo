import Image from "next/image";
import Link from "next/link";
import { STATUS_LABELS } from "@/lib/categories";
import { CategoryBadge } from "./category-badge";
import { StarRating } from "./star-rating";
import { UserAvatar } from "@/components/profile/user-avatar";
import type { WorkListItem } from "@/lib/queries";
import type { Profile } from "@/lib/types";

export function WorkCard({
  work,
  profiles,
}: {
  work: WorkListItem;
  profiles: Profile[];
}) {
  const ratingRows = profiles
    .map((profile) => {
      const rating = work.ratings.find((r) => r.userId === profile.id);
      if (!rating) return null;
      return { profile, nota: rating.nota };
    })
    .filter((row): row is { profile: Profile; nota: number } => row !== null);

  return (
    <Link
      href={`/resenas/obras/${work.id}`}
      className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
      style={{
        borderLeftColor: `var(--category-${work.tipo})`,
        borderLeftWidth: 4,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <CategoryBadge tipo={work.tipo} />
        <span className="shrink-0 text-xs text-muted-foreground">
          {STATUS_LABELS[work.estado]}
        </span>
      </div>
      {work.imagen_url && (
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-background">
          <Image
            src={work.imagen_url}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-contain"
          />
        </div>
      )}
      <h3 className="min-w-0 break-words font-heading text-lg leading-snug group-hover:underline">
        {work.titulo}
      </h3>
      {(work.autor_creador || work.anio) && (
        <p className="text-sm text-muted-foreground">
          {[work.autor_creador, work.anio].filter(Boolean).join(" · ")}
        </p>
      )}
      {ratingRows.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {ratingRows.map(({ profile, nota }) => (
            <div
              key={profile.id}
              className="flex min-w-0 items-center gap-2"
            >
              <UserAvatar
                displayName={profile.display_name}
                avatarUrl={profile.avatar_url}
                size="sm"
              />
              <StarRating value={nota} size="sm" />
            </div>
          ))}
        </div>
      )}
    </Link>
  );
}
