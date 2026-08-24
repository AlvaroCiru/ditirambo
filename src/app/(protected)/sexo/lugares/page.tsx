import Link from "next/link";
import { Plus } from "lucide-react";
import { SexoLugarCard } from "@/components/sexo/sexo-cards";
import { Button } from "@/components/ui/button";
import { SEXO_TIPO_LABELS, SEXO_TIPO_ORDER } from "@/lib/sexo-meta";
import { getSexoLugares } from "@/lib/queries-sexo";
import type { SexoLugarTipo } from "@/lib/types";
import { cn } from "@/lib/utils";

export default async function SexoLugaresPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const params = await searchParams;
  const tipo = SEXO_TIPO_ORDER.includes(params.tipo as SexoLugarTipo)
    ? (params.tipo as SexoLugarTipo)
    : undefined;
  const lugares = await getSexoLugares({ tipo });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Link
            href="/sexo/lugares"
            className={cn(
              "rounded-md px-3 py-1.5 text-sm",
              !tipo
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Todos
          </Link>
          {SEXO_TIPO_ORDER.map((t) => (
            <Link
              key={t}
              href={`/sexo/lugares?tipo=${t}`}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm",
                tipo === t
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {SEXO_TIPO_LABELS[t]}
            </Link>
          ))}
        </div>
        <Button
          size="sm"
          nativeButton={false}
          render={
            <Link href="/sexo/lugares/nuevo">
              <Plus className="size-4" />
              Nuevo
            </Link>
          }
        />
      </div>

      {lugares.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay lugares todavía.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lugares.map((lugar) => (
            <SexoLugarCard key={lugar.id} lugar={lugar} />
          ))}
        </div>
      )}
    </div>
  );
}
