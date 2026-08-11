import { getProfiles } from "@/lib/dal";
import { getDevNotesForBoard } from "@/lib/queries-notes";
import { NotesBoard } from "@/components/notes/notes-board";

export default async function NotasTableroPage() {
  const [notes, profiles] = await Promise.all([
    getDevNotesForBoard(),
    getProfiles(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Arrastra las notas entre columnas para cambiar el estado. La prioridad
        se ajusta en cada tarjeta.
      </p>
      <NotesBoard notes={notes} profiles={profiles} />
    </div>
  );
}
