import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, Plus } from "lucide-react";
import { SexoEncuentroCard } from "@/components/sexo/sexo-cards";
import { Button } from "@/components/ui/button";
import {
  formatFechaCorta,
  SEXO_TIPO_LABEL_SINGULAR,
} from "@/lib/sexo-meta";
import { getSexoEncuentros, getSexoLugar } from "@/lib/queries-sexo";

export default async function SexoLugarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [lugar, encuentros] = await Promise.all([
    getSexoLugar(id),
    getSexoEncuentros(),
  ]);
  if (!lugar) notFound();

  const delLugar = encuentros.filter((e) => e.lugar_id === id);

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
          {SEXO_TIPO_LABEL_SINGULAR[lugar.tipo]} · {lugar.estado}
        </p>
        <h2 className="mt-1 font-heading text-3xl">{lugar.nombre}</h2>
        <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" />
          {[lugar.ubicacion_texto, lugar.ciudad, lugar.provincia, lugar.pais_code]
            .filter(Boolean)
            .join(" · ") || "Sin ubicación"}
        </p>
        {delLugar[0] && (
          <p className="mt-2 text-xs text-muted-foreground">
            Último encuentro: {formatFechaCorta(delLugar[0].fecha)}
          </p>
        )}
        <div className="mt-4">
          <Button
            size="sm"
            nativeButton={false}
            render={
              <Link href="/sexo/encuentro/nuevo">
                <Plus className="size-4" />
                Añadir encuentro
              </Link>
            }
          />
        </div>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="font-heading text-xl">Encuentros</h3>
        {delLugar.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay encuentros en este lugar.
          </p>
        ) : (
          delLugar.map((e) => <SexoEncuentroCard key={e.id} encuentro={e} />)
        )}
      </section>
    </div>
  );
}
