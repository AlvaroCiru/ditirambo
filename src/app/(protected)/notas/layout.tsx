import type { ReactNode } from "react";
import { NotesSectionNav } from "@/components/notes/notes-section-nav";

export default function NotasLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl">Notas de desarrollo</h1>
        <p className="text-sm text-muted-foreground">
          Seguimiento de tareas, tablero kanban y registro de versiones.
        </p>
      </div>
      <NotesSectionNav />
      {children}
    </div>
  );
}
