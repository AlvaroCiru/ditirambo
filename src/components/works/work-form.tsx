"use client";

import { useActionState } from "react";
import { createWork, type WorkFormState } from "@/lib/actions/works";
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

const initialState: WorkFormState = {};

export function WorkForm() {
  const [state, action, pending] = useActionState(createWork, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="tipo">Categoría</Label>
        <Select name="tipo" defaultValue="pelicula">
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
        <Input id="titulo" name="titulo" required maxLength={200} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="autor_creador">Autor / creador</Label>
        <Input id="autor_creador" name="autor_creador" maxLength={200} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="anio">Año</Label>
        <Input id="anio" name="anio" type="number" min={1} max={2999} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="imagen">Portada (opcional)</Label>
        <Input id="imagen" name="imagen" type="file" accept="image/*" />
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="mt-2">
        {pending ? "Guardando…" : "Guardar obra"}
      </Button>
    </form>
  );
}
