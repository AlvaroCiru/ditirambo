import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Pencil } from "lucide-react";
import {
  CitaAcceptRejectButtons,
  CitaFinalizeButton,
} from "@/components/citas/cita-actions";
import { CitaCategoryBadge } from "@/components/citas/cita-category-badge";
import { DeleteCitaButton } from "@/components/citas/delete-cita-button";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/profile/user-avatar";
import { CITA_STATUS_LABELS } from "@/lib/cita-categories";
import { formatCitaRange } from "@/lib/cita-datetime";
import { getAuthedUser, getProfiles } from "@/lib/dal";
import { getCita } from "@/lib/queries-citas";

export default async function CitaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [cita, user, profiles] = await Promise.all([
    getCita(id),
    getAuthedUser(),
    getProfiles(),
  ]);

  if (!cita) notFound();

  const author = profiles.find((p) => p.id === cita.creado_por);
  const approver = cita.aprobado_por
    ? profiles.find((p) => p.id === cita.aprobado_por)
    : null;
  const canRespond =
    cita.estado === "propuesta" && cita.creado_por !== user.id;
  const canFinalize =
    cita.estado === "propuesta" || cita.estado === "programada";

  return (
    <div
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6"
      style={{
        borderTopColor: `var(--cita-${cita.categoria})`,
        borderTopWidth: 4,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <CitaCategoryBadge categoria={cita.categoria} />
          <span className="text-xs text-muted-foreground">
            {CITA_STATUS_LABELS[cita.estado]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Editar cita"
            nativeButton={false}
            render={
              <Link href={`/citas/${cita.id}/editar`}>
                <Pencil className="size-4" />
              </Link>
            }
          />
          <DeleteCitaButton citaId={cita.id} />
        </div>
      </div>

      {cita.imagen_url && (
        <div className="relative flex h-72 max-h-80 w-full items-center justify-center overflow-hidden rounded-lg bg-background">
          <Image
            src={cita.imagen_url}
            alt=""
            fill
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
            priority
          />
        </div>
      )}

      <h2 className="break-words font-heading text-3xl">{cita.titulo}</h2>
      <p className="text-muted-foreground">
        {formatCitaRange(cita.inicio_en, cita.fin_en)}
      </p>

      {cita.ubicacion && (
        <p className="flex items-start gap-2 text-sm">
          <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 break-words">{cita.ubicacion}</span>
        </p>
      )}

      {cita.descripcion && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {cita.descripcion}
        </p>
      )}

      {cita.recuerdo_url && (
        <section className="flex flex-col gap-2 border-t border-border pt-4">
          <h3 className="font-heading text-lg">Recuerdo</h3>
          <div className="relative flex h-72 max-h-80 w-full items-center justify-center overflow-hidden rounded-lg bg-background">
            <Image
              src={cita.recuerdo_url}
              alt="Recuerdo de la cita"
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>
        </section>
      )}

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        {author && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserAvatar
              displayName={author.display_name}
              avatarUrl={author.avatar_url}
              size="sm"
            />
            <span>Propuesta por {author.display_name}</span>
          </div>
        )}
        {approver && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserAvatar
              displayName={approver.display_name}
              avatarUrl={approver.avatar_url}
              size="sm"
            />
            <span>Aceptada por {approver.display_name}</span>
          </div>
        )}
      </div>

      {(canRespond || canFinalize) && (
        <div className="flex flex-col gap-3 border-t border-border pt-4">
          {canRespond && <CitaAcceptRejectButtons citaId={cita.id} />}
          {canFinalize && <CitaFinalizeButton citaId={cita.id} />}
        </div>
      )}
    </div>
  );
}
