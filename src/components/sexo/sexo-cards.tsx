import Image from "next/image";
import Link from "next/link";
import {
  formatFechaCorta,
  formatLocalizacion,
  SEXO_TIPO_LABEL_SINGULAR,
} from "@/lib/sexo-meta";
import type { SexoLugar } from "@/lib/types";

export function SexoLugarCard({ lugar }: { lugar: SexoLugar }) {
  return (
    <Link
      href={`/sexo/lugares/${lugar.id}`}
      className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
    >
      {lugar.imagen_url && (
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-background">
          <Image
            src={lugar.imagen_url}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {formatFechaCorta(lugar.fecha_primera)}
        <span className="mx-1.5 opacity-40">·</span>
        <span className="opacity-70">{SEXO_TIPO_LABEL_SINGULAR[lugar.tipo]}</span>
      </p>
      <h3 className="font-heading text-lg group-hover:underline">
        {lugar.nombre}
      </h3>
      <p className="text-sm text-muted-foreground">
        {formatLocalizacion(lugar)}
      </p>
    </Link>
  );
}

export function SexoLugarTimelineItem({ lugar }: { lugar: SexoLugar }) {
  return (
    <Link
      href={`/sexo/lugares/${lugar.id}`}
      className="group flex gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50"
    >
      {lugar.imagen_url ? (
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-background">
          <Image
            src={lugar.imagen_url}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex h-20 w-16 shrink-0 items-start justify-end pt-1 text-right text-xs font-medium text-muted-foreground">
          {/* date shown outside in timeline */}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="font-heading text-lg leading-snug group-hover:underline">
          {lugar.nombre}
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {formatLocalizacion(lugar)}
        </p>
        {lugar.nota && (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {lugar.nota}
          </p>
        )}
      </div>
    </Link>
  );
}
