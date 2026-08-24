import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import {
  formatFechaCorta,
  formatFechaTimeline,
  SEXO_TIPO_LABEL_SINGULAR,
} from "@/lib/sexo-meta";
import type { SexoEncuentroConLugar, SexoLugarConStats } from "@/lib/types";

export function SexoEncuentroCard({
  encuentro,
}: {
  encuentro: SexoEncuentroConLugar;
}) {
  return (
    <article className="flex gap-3 rounded-xl border border-border bg-card p-3">
      <div className="w-16 shrink-0 text-right text-xs font-medium text-muted-foreground">
        {formatFechaTimeline(encuentro.fecha)}
      </div>
      <div className="w-px shrink-0 bg-primary/50" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row">
        {encuentro.imagen_url && (
          <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-md bg-background sm:h-24 sm:w-36">
            <Image
              src={encuentro.imagen_url}
              alt=""
              fill
              sizes="144px"
              className="object-cover"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-lg leading-snug">
            {encuentro.titulo}
          </h3>
          {encuentro.notas && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {encuentro.notas}
            </p>
          )}
          <Link
            href={`/sexo/lugares/${encuentro.lugar.id}`}
            className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <MapPin className="size-3.5" />
            {[encuentro.lugar.nombre, encuentro.lugar.ciudad, encuentro.lugar.provincia]
              .filter(Boolean)
              .join(" · ")}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function SexoLugarCard({ lugar }: { lugar: SexoLugarConStats }) {
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
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {SEXO_TIPO_LABEL_SINGULAR[lugar.tipo]}
        </span>
        <span className="text-xs text-muted-foreground">
          {lugar.encuentros_count} encuentro
          {lugar.encuentros_count === 1 ? "" : "s"}
        </span>
      </div>
      <h3 className="font-heading text-lg group-hover:underline">
        {lugar.nombre}
      </h3>
      <p className="text-sm text-muted-foreground">
        {[lugar.ciudad, lugar.provincia, lugar.pais_code]
          .filter(Boolean)
          .join(", ") || lugar.ubicacion_texto || "Sin ubicación"}
      </p>
      {lugar.ultima_fecha && (
        <p className="text-xs text-muted-foreground">
          Último: {formatFechaCorta(lugar.ultima_fecha)}
        </p>
      )}
    </Link>
  );
}
