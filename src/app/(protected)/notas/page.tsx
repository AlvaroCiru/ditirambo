import { getProfiles } from "@/lib/dal";
import { getDevNotes } from "@/lib/queries-notes";
import { NoteForm } from "@/components/notes/note-form";
import { NoteList } from "@/components/notes/note-list";

export default async function NotasPage() {
  const [notes, profiles] = await Promise.all([getDevNotes(), getProfiles()]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl">Notas de desarrollo</h1>
        <p className="text-sm text-muted-foreground">
          Apuntes sobre futuras actualizaciones y funcionalidades de la página.
        </p>
      </div>

      <NoteForm />

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-xl">Cuaderno</h2>
        <NoteList notes={notes} profiles={profiles} />
      </section>
    </div>
  );
}
