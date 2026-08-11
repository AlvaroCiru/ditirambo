import { getProfiles } from "@/lib/dal";
import { getDevNotes } from "@/lib/queries-notes";
import { NoteForm } from "@/components/notes/note-form";
import { NoteList } from "@/components/notes/note-list";

export default async function NotasPage() {
  const [notes, profiles] = await Promise.all([getDevNotes(), getProfiles()]);

  return (
    <div className="flex flex-col gap-8">
      <NoteForm />
      <NoteList notes={notes} profiles={profiles} />
    </div>
  );
}
