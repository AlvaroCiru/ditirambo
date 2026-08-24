import Link from "next/link";
import { Plus } from "lucide-react";
import { SexoEncuentroCard } from "@/components/sexo/sexo-cards";
import { Button } from "@/components/ui/button";
import {
  formatFechaCorta,
  SEXO_TIPO_LABELS,
  SEXO_TIPO_ORDER,
} from "@/lib/sexo-meta";
import {
  getSexoCuriosidades,
  getSexoEncuentros,
} from "@/lib/queries-sexo";

export default async function SexoInicioPage() {
  const [curiosidades, encuentros] = await Promise.all([
    getSexoCuriosidades(),
    getSexoEncuentros(8),
  ]);

  const stats = [
    { label: "Lugares", value: curiosidades.lugares },
    { label: "Provincias", value: curiosidades.provincias },
    { label: "Países", value: curiosidades.paises },
    { label: "Encuentros", value: curiosidades.encuentros },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card px-4 py-3"
          >
            <p className="text-2xl font-heading">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
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
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href="/sexo/mapa">Ver mapa detallado</Link>}
        />
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href="/sexo/lugares/nuevo">Nuevo lugar</Link>}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl">Línea temporal</h2>
            <Link
              href="/sexo/timeline"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Ver todas
            </Link>
          </div>
          {encuentros.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay encuentros registrados.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {encuentros.map((e) => (
                <SexoEncuentroCard key={e.id} encuentro={e} />
              ))}
            </div>
          )}
        </section>

        <div className="flex flex-col gap-6">
          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 font-heading text-lg">Lugares</h2>
            <ul className="flex flex-col gap-2">
              {SEXO_TIPO_ORDER.map((tipo) => (
                <li key={tipo}>
                  <Link
                    href={`/sexo/lugares?tipo=${tipo}`}
                    className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-secondary/50"
                  >
                    <span>{SEXO_TIPO_LABELS[tipo]}</span>
                    <span className="text-muted-foreground">
                      {curiosidades.porTipo[tipo]}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 font-heading text-lg">Curiosidades</h2>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Primera vez</dt>
                <dd>
                  {curiosidades.primeraFecha
                    ? formatFechaCorta(curiosidades.primeraFecha)
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Último encuentro</dt>
                <dd>
                  {curiosidades.ultimaFecha
                    ? formatFechaCorta(curiosidades.ultimaFecha)
                    : "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Provincia top</dt>
                <dd>{curiosidades.provinciaMasRepetida ?? "—"}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Más lejos</dt>
                <dd>
                  {curiosidades.masLejos
                    ? `${curiosidades.masLejos.km} km`
                    : "—"}
                </dd>
              </div>
            </dl>
            <Link
              href="/sexo/curiosidades"
              className="mt-3 inline-block text-sm text-muted-foreground hover:text-foreground"
            >
              Ver todas las curiosidades
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
