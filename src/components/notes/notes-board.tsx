"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteDevNote, updateDevNoteStatus } from "@/lib/actions/notes";
import { NotePrioritySelect } from "@/components/notes/note-priority-select";
import { Button } from "@/components/ui/button";
import {
  NOTE_STATUS_LABELS,
  NOTE_STATUS_ORDER,
} from "@/lib/notes-meta";
import type { DevNote, DevNoteStatus, Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

function BoardCard({
  note,
  authorName,
}: {
  note: DevNote;
  authorName: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <article
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData("text/note-id", note.id);
        event.dataTransfer.effectAllowed = "move";
      }}
      className="cursor-grab rounded-lg border border-border bg-background p-3 active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 font-heading text-base leading-snug break-words">
          {note.titulo}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Borrar nota"
          disabled={pending}
          className="shrink-0"
          onClick={() => {
            startTransition(async () => {
              await deleteDevNote(note.id);
            });
          }}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
      {note.cuerpo && (
        <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
          {note.cuerpo}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <NotePrioritySelect noteId={note.id} prioridad={note.prioridad} />
        <span className="truncate text-[11px] text-muted-foreground">
          {authorName}
        </span>
      </div>
    </article>
  );
}

function BoardColumn({
  status,
  notes,
  profiles,
}: {
  status: DevNoteStatus;
  notes: DevNote[];
  profiles: Profile[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    <section
      className={cn(
        "flex min-h-64 min-w-[16rem] flex-1 flex-col gap-3 rounded-xl border border-border bg-card p-3",
        pending && "opacity-80",
      )}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
      onDrop={(event) => {
        event.preventDefault();
        const noteId = event.dataTransfer.getData("text/note-id");
        if (!noteId) return;
        startTransition(() => {
          void updateDevNoteStatus(noteId, status);
        });
      }}
    >
      <header className="flex items-center justify-between gap-2 px-1">
        <h2 className="font-heading text-base">
          {NOTE_STATUS_LABELS[status]}
        </h2>
        <span className="text-xs text-muted-foreground">{notes.length}</span>
      </header>
      <div className="flex flex-col gap-2">
        {notes.length === 0 ? (
          <p className="px-1 text-xs text-muted-foreground">
            Arrastra aquí una nota.
          </p>
        ) : (
          notes.map((note) => (
            <BoardCard
              key={note.id}
              note={note}
              authorName={
                profiles.find((p) => p.id === note.creado_por)?.display_name ??
                "Alguien"
              }
            />
          ))
        )}
      </div>
    </section>
  );
}

export function NotesBoard({
  notes,
  profiles,
}: {
  notes: DevNote[];
  profiles: Profile[];
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {NOTE_STATUS_ORDER.map((status) => (
        <BoardColumn
          key={status}
          status={status}
          notes={notes.filter((n) => n.estado === status)}
          profiles={profiles}
        />
      ))}
    </div>
  );
}
