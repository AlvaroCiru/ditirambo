import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { CITA_STATUS_LABELS } from "@/lib/cita-categories";
import { formatCitaRange } from "@/lib/cita-datetime";
import { CitaCategoryBadge } from "./cita-category-badge";
import { UserAvatar } from "@/components/profile/user-avatar";
import type { Cita, Profile } from "@/lib/types";

export function CitaCard({
  cita,
  profiles,
}: {
  cita: Cita;
  profiles: Profile[];
}) {
  const author = profiles.find((p) => p.id === cita.creado_por);

  return (
    <Link
      href={`/citas/${cita.id}`}
      className="group flex flex-col gap-2 rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
      style={{
        borderLeftColor: `var(--cita-${cita.categoria})`,
        borderLeftWidth: 4,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <CitaCategoryBadge categoria={cita.categoria} />
        <span className="shrink-0 text-xs text-muted-foreground">
          {CITA_STATUS_LABELS[cita.estado]}
        </span>
      </div>
      {cita.imagen_url && (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-background">
          <Image
            src={cita.imagen_url}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      )}
      <h3 className="min-w-0 break-words font-heading text-lg leading-snug group-hover:underline">
        {cita.titulo}
      </h3>
      <p className="text-sm text-muted-foreground">
        {formatCitaRange(cita.inicio_en, cita.fin_en)}
      </p>
      {cita.ubicacion && (
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-3.5 shrink-0" />
          <span className="min-w-0 break-words">{cita.ubicacion}</span>
        </p>
      )}
      {author && (
        <div className="mt-1 flex items-center gap-2">
          <UserAvatar
            displayName={author.display_name}
            avatarUrl={author.avatar_url}
            size="sm"
          />
          <span className="truncate text-xs text-muted-foreground">
            Propuesta por {author.display_name}
          </span>
        </div>
      )}
    </Link>
  );
}
