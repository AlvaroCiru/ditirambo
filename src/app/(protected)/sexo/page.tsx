import Link from "next/link";
import { Plus } from "lucide-react";
import { SexoLugarCard } from "@/components/sexo/sexo-cards";
import { Button } from "@/components/ui/button";
import { formatFechaCorta } from "@/lib/sexo-meta";
import { getSexoCuriosidades, getSexoLugares } from "@/lib/queries-sexo";

export default async function SexoInicioPage() {
  const [curiosidades, lugares] = await Promise.all([
    getSexoCuriosidades(),
    getSexoLugares({ sort: "recientes" }),
  ]);

  const ultimos = lugares.slice(0, 6);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h2 className="font-heading text-3xl tracking-tight">SEXO</h2>
        <Button
          className="self-start"
          nativeButton={false}
          render={
            <Link href="/sexo/lugares/nuevo">
              <Plus className="size-4" />
              Añadir lugar
            </Link>
          }
        />
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-heading text-xl">Nuestra historia</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {curiosidades.lugares} lugares · {curiosidades.provincias} provincias ·{" "}
          {curiosidades.paises} países
        </p>
        {curiosidades.primeraFecha && (
          <p className="mt-1 text-sm text-muted-foreground">
            Desde {formatFechaCorta(curiosidades.primeraFecha)}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <Link
            href="/sexo/curiosidades"
            className="text-primary underline-offset-2 hover:underline"
          >
            Ver curiosidades
          </Link>
          <Link
            href="/sexo/ajustes"
            className="text-muted-foreground underline-offset-2 hover:underline"
          >
            Ajustes de casa
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-heading text-xl">Últimos lugares</h3>
          <Link
            href="/sexo/lugares"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Ver todos
          </Link>
        </div>
        {ultimos.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Todavía no hay lugares. Empieza añadiendo el primero.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ultimos.map((lugar) => (
              <SexoLugarCard key={lugar.id} lugar={lugar} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
