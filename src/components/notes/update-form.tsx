"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAppUpdate, type UpdateFormState } from "@/lib/actions/updates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatAppVersion } from "@/lib/updates-meta";

const initialState: UpdateFormState = {};

const PLACEHOLDER = `1. Nuevas funcionalidades
-

2. Errores / correcciones
- Ninguno en esta tanda.

3. Futuras actualizaciones
-`;

export function UpdateForm({
  nextMajor,
  nextMinor,
}: {
  nextMajor: number;
  nextMinor: number;
}) {
  const [state, formAction, pending] = useActionState(
    createAppUpdate,
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
        <h2 className="font-heading text-lg">Nueva actualización</h2>
        <p className="text-xs text-muted-foreground">
          Próxima versión prevista:{" "}
          <span className="font-medium text-accent">
            {formatAppVersion(nextMajor, nextMinor)}
          </span>
          . Habitualmente se publica al cerrar una sesión de trabajo (desde el
          agente de desarrollo).
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          name="titulo"
          required
          maxLength={160}
          placeholder="Resumen breve de la tanda"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="cuerpo">Detalle</Label>
        <Textarea
          id="cuerpo"
          name="cuerpo"
          required
          rows={10}
          maxLength={8000}
          defaultValue={PLACEHOLDER}
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="bumpMajor"
          value="si"
          className="size-4 accent-primary"
        />
        Subir versión mayor (p. ej. de v.1.xx a v.2.01)
      </label>
      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Publicando…" : "Publicar actualización"}
      </Button>
    </form>
  );
}
