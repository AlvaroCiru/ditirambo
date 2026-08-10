import Link from "next/link";
import { Plus } from "lucide-react";
import { getWorks } from "@/lib/queries";
import { WorksFilters } from "@/components/works/works-filters";
import { WorkCard } from "@/components/works/work-card";
import { Button } from "@/components/ui/button";
import type { WorkStatus, WorkType } from "@/lib/types";

export default async function ObrasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tipo?: string; estado?: string }>;
}) {
  const params = await searchParams;
  const works = await getWorks({
    q: params.q,
    tipo: params.tipo as WorkType | undefined,
    estado: params.estado as WorkStatus | undefined,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-heading text-2xl">Obras</h1>
        <Button
          size="sm"
          nativeButton={false}
          render={
            <Link href="/resenas/obras/nueva">
              <Plus className="size-4" />
              Añadir
            </Link>
          }
        />
      </div>
      <WorksFilters />
      {works.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No hay obras que coincidan con la búsqueda.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {works.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      )}
    </div>
  );
}
