import type { ReactNode } from "react";
import { SexoSectionNav } from "@/components/sexo/sexo-section-nav";

export default function SexoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl">Sexo</h1>
        <p className="text-sm text-muted-foreground">
          Lugares, encuentros, mapa y pendientes compartidos.
        </p>
      </div>
      <SexoSectionNav />
      {children}
    </div>
  );
}
