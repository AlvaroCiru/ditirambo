import Link from "next/link";
import { Plus } from "lucide-react";
import { SexoEncuentroCard } from "@/components/sexo/sexo-cards";
import { Button } from "@/components/ui/button";
import { getSexoEncuentros } from "@/lib/queries-sexo";

export default async function SexoTimelinePage() {
  const encuentros = await getSexoEncuentros();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
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
      {encuentros.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          La línea temporal está vacía.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {encuentros.map((e) => (
            <SexoEncuentroCard key={e.id} encuentro={e} />
          ))}
        </div>
      )}
    </div>
  );
}
