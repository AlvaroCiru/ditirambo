import Link from "next/link";
import Image from "next/image";
import {
  formatFechaTimeline,
  formatLocalizacion,
  formatMesAnio,
} from "@/lib/sexo-meta";
import { getSexoLugares } from "@/lib/queries-sexo";
import type { SexoLugar } from "@/lib/types";

type MonthGroup = {
  key: string;
  label: string;
  lugares: SexoLugar[];
};

type YearGroup = {
  year: string;
  months: MonthGroup[];
};

function groupByYearMonth(lugares: SexoLugar[]): YearGroup[] {
  const yearMap = new Map<string, Map<string, MonthGroup>>();

  for (const lugar of lugares) {
    const fecha = lugar.fecha_primera;
    const year = fecha.slice(0, 4);
    const monthKey = fecha.slice(0, 7);
    if (!yearMap.has(year)) yearMap.set(year, new Map());
    const months = yearMap.get(year)!;
    if (!months.has(monthKey)) {
      months.set(monthKey, {
        key: monthKey,
        label: formatMesAnio(fecha),
        lugares: [],
      });
    }
    months.get(monthKey)!.lugares.push(lugar);
  }

  return [...yearMap.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([year, months]) => ({
      year,
      months: [...months.values()].sort((a, b) => b.key.localeCompare(a.key)),
    }));
}

export default async function SexoTimelinePage() {
  const lugares = await getSexoLugares({ sort: "recientes" });
  const groups = groupByYearMonth(lugares);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-heading text-xl">Línea temporal</h2>
      <p className="text-sm text-muted-foreground">
        Cada lugar aparece una sola vez, en la fecha de la primera vez.
      </p>

      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aún no hay lugares.{" "}
          <Link href="/sexo/lugares/nuevo" className="underline">
            Añadir el primero
          </Link>
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map((year) => (
            <section key={year.year} className="flex flex-col gap-5">
              <h3 className="font-heading text-2xl text-muted-foreground">
                {year.year}
              </h3>
              {year.months.map((month) => (
                <div key={month.key} className="flex flex-col gap-3">
                  <h4 className="text-sm font-medium tracking-wide text-muted-foreground">
                    {month.label}
                  </h4>
                  <ol className="relative ml-2 border-l border-primary/40 pl-5">
                    {month.lugares.map((lugar) => (
                      <li key={lugar.id} className="relative pb-5 last:pb-0">
                        <span className="absolute -left-[1.4rem] top-1.5 size-2.5 rounded-full bg-primary" />
                        <p className="text-xs font-medium text-muted-foreground">
                          {formatFechaTimeline(lugar.fecha_primera)}
                        </p>
                        <Link
                          href={`/sexo/lugares/${lugar.id}`}
                          className="mt-1.5 flex gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/50"
                        >
                          {lugar.imagen_url && (
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-background">
                              <Image
                                src={lugar.imagen_url}
                                alt=""
                                fill
                                sizes="64px"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-heading text-lg leading-snug">
                              {lugar.nombre}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatLocalizacion(lugar)}
                            </p>
                            {lugar.nota && (
                              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                {lugar.nota}
                              </p>
                            )}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
