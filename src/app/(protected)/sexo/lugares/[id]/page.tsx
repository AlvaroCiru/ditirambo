import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Pencil } from "lucide-react";
import { SexoLugarDeleteButton } from "@/components/sexo/sexo-lugar-delete";
import { SexoLugarStaticMap } from "@/components/sexo/sexo-lugar-static-map";
import { Button } from "@/components/ui/button";
import {
  formatFechaCorta,
  formatLocalizacion,
  SEXO_TIPO_LABEL_SINGULAR,
} from "@/lib/sexo-meta";
import { getSexoLugar } from "@/lib/queries-sexo";

export default async function SexoLugarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lugar = await getSexoLugar(id);
  if (!lugar) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-6">
        {lugar.imagen_url && (
          <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-lg bg-background">
            <Image
              src={lugar.imagen_url}
              alt=""
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
              priority
            />
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          {formatFechaCorta(lugar.fecha_primera)}
          <span className="mx-1.5 opacity-40">·</span>
          {SEXO_TIPO_LABEL_SINGULAR[lugar.tipo]}
        </p>
        <h2 className="mt-1 font-heading text-3xl">{lugar.nombre}</h2>

        <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Localidad</dt>
            <dd>{lugar.ciudad || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Provincia</dt>
            <dd>{lugar.provincia || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Comunidad</dt>
            <dd>{lugar.comunidad_autonoma || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">País</dt>
            <dd>{lugar.pais_code || "—"}</dd>
          </div>
        </dl>

        {(lugar.ubicacion_texto || lugar.ciudad) && (
          <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            {lugar.ubicacion_texto || formatLocalizacion(lugar)}
          </p>
        )}

        {lugar.nota && (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
            {lugar.nota}
          </p>
        )}

        {lugar.lat != null && lugar.lng != null && (
          <div className="mt-4 overflow-hidden rounded-xl">
            <SexoLugarStaticMap lat={lugar.lat} lng={lugar.lng} />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            nativeButton={false}
            render={
              <Link href={`/sexo/lugares/${lugar.id}/editar`}>
                <Pencil className="size-4" />
                Editar
              </Link>
            }
          />
          <SexoLugarDeleteButton id={lugar.id} />
        </div>
      </div>
    </div>
  );
}
