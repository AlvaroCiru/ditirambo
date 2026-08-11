"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteDevNote } from "@/lib/actions/notes";
import { NotePrioritySelect } from "@/components/notes/note-priority-select";
import { NoteStatusSelect } from "@/components/notes/note-status-select";
import { Button } from "@/components/ui/button";
import { formatNoteCodigo, NOTE_PRIORITY_WEIGHT } from "@/lib/notes-meta";
import type { DevNote, Profile } from "@/lib/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function sortPending(a: DevNote, b: DevNote) {
  const byPriority =
    NOTE_PRIORITY_WEIGHT[a.prioridad] - NOTE_PRIORITY_WEIGHT[b.prioridad];
  if (byPriority !== 0) return byPriority;
  return new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime();
}

function NoteCard({
  note,
  authorName,
}: {
  note: DevNote;
  authorName: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tabular-nums text-accent">
            {formatNoteCodigo(note.codigo)}
          </p>
          <h3 className="font-heading text-lg leading-snug break-words">
            {note.titulo}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {authorName} · {formatDate(note.creado_en)}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Borrar nota"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              await deleteDevNote(note.id);
            });
          }}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      {note.cuerpo && (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {note.cuerpo}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <NoteStatusSelect noteId={note.id} estado={note.estado} />
        <NotePrioritySelect noteId={note.id} prioridad={note.prioridad} />
      </div>
    </li>
  );
}

export function NoteList({
  notes,
  profiles,
}: {
  notes: DevNote[];
  profiles: Profile[];
}) {
  const pending = notes
    .filter((n) => n.estado !== "hecho")
    .sort(sortPending);
  const done = notes
    .filter((n) => n.estado === "hecho")
    .sort(
      (a, b) =>
        new Date(b.actualizado_en).getTime() -
        new Date(a.actualizado_en).getTime(),
    );

  if (notes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay notas. Dejad la primera idea arriba.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl">
          Pendientes{" "}
          <span className="text-base font-normal text-muted-foreground">
            ({pending.length})
          </span>
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay nada pendiente. Todo hecho por ahora.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {pending.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                authorName={
                  profiles.find((p) => p.id === note.creado_por)?.display_name ??
                  "Alguien"
                }
              />
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-xl">
          Finalizadas{" "}
          <span className="text-base font-normal text-muted-foreground">
            ({done.length})
          </span>
        </h2>
        {done.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay notas marcadas como hechas.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {done.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                authorName={
                  profiles.find((p) => p.id === note.creado_por)?.display_name ??
                  "Alguien"
                }
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
