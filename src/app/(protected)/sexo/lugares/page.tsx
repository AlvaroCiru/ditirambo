import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { SexoLugarCard } from "@/components/sexo/sexo-cards";
import { SexoLugaresFilters } from "@/components/sexo/sexo-lugares-filters";
import { Button } from "@/components/ui/button";
import { getSexoLugares, type SexoLugarSort } from "@/lib/queries-sexo";
import type { SexoLugarTipo } from "@/lib/types";
import { SEXO_TIPO_ORDER } from "@/lib/sexo-meta";

export default async function SexoLugaresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; tipo?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const sort = (["recientes", "antiguos", "nombre"].includes(sp.sort ?? "")
    ? sp.sort
    : "recientes") as SexoLugarSort;
  const tipo =
    sp.tipo && (SEXO_TIPO_ORDER as string[]).includes(sp.tipo)
      ? (sp.tipo as SexoLugarTipo)
      : undefined;

  const lugares = await getSexoLugares({ tipo, sort, q: q || undefined });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-heading text-xl">Lugares</h2>
        <Button
          size="sm"
          nativeButton={false}
          render={
            <Link href="/sexo/lugares/nuevo">
              <Plus className="size-4" />
              Añadir lugar
            </Link>
          }
        />
      </div>

      <Suspense fallback={null}>
        <SexoLugaresFilters q={q} sort={sort} tipo={tipo ?? "todos"} />
      </Suspense>

      {lugares.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay lugares{q ? " con ese filtro" : ""}.{" "}
          <Link href="/sexo/lugares/nuevo" className="underline">
            Añadir el primero
          </Link>
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lugares.map((lugar) => (
            <SexoLugarCard key={lugar.id} lugar={lugar} />
          ))}
        </div>
      )}
    </div>
  );
}
