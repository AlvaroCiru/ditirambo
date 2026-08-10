"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteDevNote } from "@/lib/actions/notes";
import { Button } from "@/components/ui/button";
import type { DevNote, Profile } from "@/lib/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function NoteList({
  notes,
  profiles,
}: {
  notes: DevNote[];
  profiles: Profile[];
}) {
  const [pending, startTransition] = useTransition();

  if (notes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay notas. Dejad la primera idea arriba.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {notes.map((note) => {
        const author = profiles.find((p) => p.id === note.creado_por);

        return (
          <li
            key={note.id}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-heading text-lg leading-snug break-words">
                  {note.titulo}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {author?.display_name ?? "Alguien"} ·{" "}
                  {formatDate(note.creado_en)}
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
          </li>
        );
      })}
    </ul>
  );
}
