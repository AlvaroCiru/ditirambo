import type { ReactNode } from "react";
import { CitasSectionNav } from "@/components/citas/citas-section-nav";

export default function CitasLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl">Planificador de citas</h1>
        <p className="text-sm text-muted-foreground">
          Propuestas, calendario compartido y registro de planes.
        </p>
      </div>
      <CitasSectionNav />
      {children}
    </div>
  );
}
