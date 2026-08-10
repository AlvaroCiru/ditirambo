"use client";

import { useActionState } from "react";
import { createWork, updateWork, type WorkFormState } from "@/lib/actions/works";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORY_CONFIG, CATEGORY_ORDER } from "@/lib/categories";
import type { Work } from "@/lib/types";

const initialState: WorkFormState = {};

export function WorkForm({ work }: { work?: Work }) {
  const action = work ? updateWork.bind(null, work.id) : createWork;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="tipo">Categoría</Label>
        <Select name="tipo" defaultValue={work?.tipo ?? "pelicula"}>
          <SelectTrigger id="tipo" className="w-full">
            <SelectValue placeholder="Elige una categoría" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_ORDER.map((tipo) => (
              <SelectItem key={tipo} value={tipo}>
                {CATEGORY_CONFIG[tipo].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          name="titulo"
          required
          maxLength={200}
          defaultValue={work?.titulo}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
        <div className="flex min-w-0 flex-col gap-2">
          <Label htmlFor="autor_creador">Autor / creador</Label>
          <Input
            id="autor_creador"
            name="autor_creador"
            maxLength={200}
            defaultValue={work?.autor_creador ?? undefined}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="anio">Año</Label>
          <Input
            id="anio"
            name="anio"
            type="number"
            min={1}
            max={2999}
            defaultValue={work?.anio ?? undefined}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="imagen">
          Portada {work ? "(déjalo vacío para no cambiarla)" : "(opcional)"}
        </Label>
        <Input id="imagen" name="imagen" type="file" accept="image/*" />
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Guardando…" : work ? "Guardar cambios" : "Guardar obra"}
      </Button>
    </form>
  );
}
