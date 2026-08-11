"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useTransition,
  type DragEvent,
} from "react";
import { Trash2 } from "lucide-react";
import { deleteDevNote, updateDevNoteStatus } from "@/lib/actions/notes";
import { NotePrioritySelect } from "@/components/notes/note-priority-select";
import { Button } from "@/components/ui/button";
import {
  formatNoteCodigo,
  NOTE_STATUS_LABELS,
  NOTE_STATUS_ORDER,
} from "@/lib/notes-meta";
import type { DevNote, DevNoteStatus, Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

const BoardDragContext = createContext<{
  draggingId: string | null;
  setDraggingId: (id: string | null) => void;
} | null>(null);

function isInteractiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(
    target.closest(
      "button, a, input, textarea, select, [role='combobox'], [role='listbox'], [data-slot='select-trigger']",
    ),
  );
}

function BoardCard({
  note,
  authorName,
}: {
  note: DevNote;
  authorName: string;
}) {
  const drag = useContext(BoardDragContext);
  const [pending, startTransition] = useTransition();
  const cardRef = useRef<HTMLElement>(null);
  const ghostRef = useRef<HTMLElement | null>(null);

  const clearGhost = () => {
    ghostRef.current?.remove();
    ghostRef.current = null;
  };

  return (
    <article
      ref={cardRef}
      draggable
      onDragStart={(event: DragEvent<HTMLElement>) => {
        if (isInteractiveTarget(event.target)) {
          event.preventDefault();
          return;
        }

        event.dataTransfer.setData("text/plain", note.id);
        event.dataTransfer.setData("text/note-id", note.id);
        event.dataTransfer.effectAllowed = "move";

        const card = cardRef.current;
        if (card) {
          // Fantasma propio: el preview nativo en desktop empuja el overflow-x.
          const ghost = card.cloneNode(true) as HTMLElement;
          ghost.style.width = `${card.offsetWidth}px`;
          ghost.style.position = "fixed";
          ghost.style.top = "-9999px";
          ghost.style.left = "-9999px";
          ghost.style.pointerEvents = "none";
          ghost.style.opacity = "0.92";
          ghost.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
          document.body.appendChild(ghost);
          ghostRef.current = ghost;
          event.dataTransfer.setDragImage(ghost, 24, 24);
        }

        drag?.setDraggingId(note.id);
      }}
      onDragEnd={() => {
        clearGhost();
        drag?.setDraggingId(null);
      }}
      className={cn(
        "cursor-grab touch-none rounded-lg border border-border bg-background p-3 active:cursor-grabbing",
        drag?.draggingId === note.id && "opacity-40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-medium tabular-nums text-accent">
            {formatNoteCodigo(note.codigo)}
          </p>
          <h3 className="font-heading text-base leading-snug break-words">
            {note.titulo}
          </h3>
        </div>
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
  isDropTarget,
  onDragEnterColumn,
}: {
  status: DevNoteStatus;
  notes: DevNote[];
  profiles: Profile[];
  isDropTarget: boolean;
  onDragEnterColumn: (status: DevNoteStatus) => void;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <section
      className={cn(
        "flex min-h-64 min-w-[16rem] flex-1 flex-col gap-3 rounded-xl border border-border bg-card p-3 transition-colors",
        isDropTarget && "border-accent bg-accent/5",
        pending && "opacity-80",
      )}
      onDragEnter={() => onDragEnterColumn(status)}
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
      }}
      onDrop={(event) => {
        event.preventDefault();
        const noteId =
          event.dataTransfer.getData("text/note-id") ||
          event.dataTransfer.getData("text/plain");
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
            Suelta aquí una nota.
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
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<DevNoteStatus | null>(null);

  const setDragging = useCallback((id: string | null) => {
    setDraggingId(id);
    if (!id) setOverStatus(null);
  }, []);

  useEffect(() => {
    if (!draggingId) return;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    return () => {
      document.body.style.userSelect = previousUserSelect;
    };
  }, [draggingId]);

  return (
    <BoardDragContext.Provider
      value={{ draggingId, setDraggingId: setDragging }}
    >
      <div
        className={cn(
          "flex gap-3 pb-2",
          // El auto-scroll de overflow-x durante HTML5 DnD es lo que “arrastra la hoja” en desktop.
          draggingId ? "overflow-x-hidden" : "overflow-x-auto",
        )}
      >
        {NOTE_STATUS_ORDER.map((status) => (
          <BoardColumn
            key={status}
            status={status}
            notes={notes.filter((n) => n.estado === status)}
            profiles={profiles}
            isDropTarget={draggingId != null && overStatus === status}
            onDragEnterColumn={setOverStatus}
          />
        ))}
      </div>
    </BoardDragContext.Provider>
  );
}
