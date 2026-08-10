"use client";

import { useActionState, useEffect, useRef } from "react";
import { createDevNote, type NoteFormState } from "@/lib/actions/notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: NoteFormState = {};

export function NoteForm() {
  const [state, formAction, pending] = useActionState(
    createDevNote,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state?.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5"
    >
      <div>
        <h2 className="font-heading text-lg">Nueva nota</h2>
        <p className="text-xs text-muted-foreground">
          Apunta ideas, mejoras o cosas que falten por hacer.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="titulo">Título</Label>
        <Input id="titulo" name="titulo" required maxLength={160} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="cuerpo">Detalle</Label>
        <Textarea
          id="cuerpo"
          name="cuerpo"
          rows={4}
          maxLength={8000}
          placeholder="Qué queremos añadir o cambiar…"
        />
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Guardando…" : "Añadir nota"}
      </Button>
    </form>
  );
}
