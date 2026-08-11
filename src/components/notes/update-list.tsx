"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import {
  deleteAppUpdate,
  updateAppUpdate,
  type UpdateFormState,
} from "@/lib/actions/updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatAppVersion } from "@/lib/updates-meta";
import type { AppUpdate, Profile } from "@/lib/types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function UpdateEditor({
  update,
  onDone,
}: {
  update: AppUpdate;
  onDone: () => void;
}) {
  const [state, setState] = useState<UpdateFormState>({});
  const [pending, startTransition] = useTransition();
  const bound = updateAppUpdate.bind(null, update.id);

  return (
    <form
      className="mt-3 flex flex-col gap-3 border-t border-border pt-3"
      action={(formData) => {
        startTransition(async () => {
          const result = await bound({}, formData);
          setState(result);
          if (result.success) onDone();
        });
      }}
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor={`titulo-${update.id}`}>Título</Label>
        <Input
          id={`titulo-${update.id}`}
          name="titulo"
          required
          maxLength={160}
          defaultValue={update.titulo}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`cuerpo-${update.id}`}>Detalle</Label>
        <Textarea
          id={`cuerpo-${update.id}`}
          name="cuerpo"
          required
          rows={10}
          maxLength={8000}
          defaultValue={update.cuerpo}
        />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Guardando…" : "Guardar"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={onDone}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

function UpdateCard({
  update,
  authorName,
}: {
  update: AppUpdate;
  authorName: string;
}) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const version = formatAppVersion(
    update.version_major,
    update.version_minor,
  );

  return (
    <li className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium tabular-nums text-accent">
            {version}
          </p>
          <h3 className="font-heading text-lg leading-snug break-words">
            {update.titulo}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {authorName} · {formatDate(update.creado_en)}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Editar actualización"
            disabled={pending || editing}
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Borrar actualización"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                await deleteAppUpdate(update.id);
              });
            }}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
      {editing ? (
        <UpdateEditor update={update} onDone={() => setEditing(false)} />
      ) : (
        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {update.cuerpo}
        </p>
      )}
    </li>
  );
}

export function UpdateList({
  updates,
  profiles,
}: {
  updates: AppUpdate[];
  profiles: Profile[];
}) {
  if (updates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no hay actualizaciones publicadas.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {updates.map((update) => (
        <UpdateCard
          key={update.id}
          update={update}
          authorName={
            profiles.find((p) => p.id === update.creado_por)?.display_name ??
            "Alguien"
          }
        />
      ))}
    </ul>
  );
}
