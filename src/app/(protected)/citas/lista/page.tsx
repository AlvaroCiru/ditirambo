import { Suspense } from "react";
import { CitaCard } from "@/components/citas/cita-card";
import { CitasFilters } from "@/components/citas/citas-filters";
import { CITA_CATEGORY_ORDER } from "@/lib/cita-categories";
import { getProfiles } from "@/lib/dal";
import { getCitas } from "@/lib/queries-citas";
import type { CitaCategoria, CitaEstado } from "@/lib/types";

const ESTADOS: CitaEstado[] = ["propuesta", "programada", "finalizada"];

export default async function CitasListaPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; categoria?: string }>;
}) {
  const params = await searchParams;
  const estado = ESTADOS.includes(params.estado as CitaEstado)
    ? (params.estado as CitaEstado)
    : undefined;
  const categoria = CITA_CATEGORY_ORDER.includes(
    params.categoria as CitaCategoria,
  )
    ? (params.categoria as CitaCategoria)
    : undefined;

  const [citas, profiles] = await Promise.all([
    getCitas({ estado, categoria }),
    getProfiles(),
  ]);

  const propuestas = citas.filter((c) => c.estado === "propuesta");
  const programadas = citas.filter((c) => c.estado === "programada");
  const finalizadas = citas.filter((c) => c.estado === "finalizada");

  const sections = estado
    ? [
        {
          key: estado,
          title:
            estado === "propuesta"
              ? "Propuestas"
              : estado === "programada"
                ? "Programadas"
                : "Finalizadas",
          items:
            estado === "propuesta"
              ? propuestas
              : estado === "programada"
                ? programadas
                : finalizadas,
        },
      ]
    : [
        { key: "propuesta", title: "Propuestas", items: propuestas },
        { key: "programada", title: "Programadas", items: programadas },
        { key: "finalizada", title: "Finalizadas", items: finalizadas },
      ];

  return (
    <div className="flex flex-col gap-6">
      <Suspense fallback={null}>
        <CitasFilters />
      </Suspense>

      {citas.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay citas que coincidan con el filtro.
        </p>
      ) : (
        sections.map((section) =>
          section.items.length === 0 ? null : (
            <section key={section.key} className="flex flex-col gap-3">
              <h2 className="font-heading text-lg">{section.title}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {section.items.map((cita) => (
                  <CitaCard key={cita.id} cita={cita} profiles={profiles} />
                ))}
              </div>
            </section>
          ),
        )
      )}
    </div>
  );
}
