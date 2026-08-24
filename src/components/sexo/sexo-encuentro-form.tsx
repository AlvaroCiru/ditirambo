"use client";

import { useActionState } from "react";
import { createSexoEncuentro, type SexoFormState } from "@/lib/actions/sexo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SexoLugar } from "@/lib/types";

const initialState: SexoFormState = {};

export function SexoEncuentroForm({ lugares }: { lugares: SexoLugar[] }) {
  const [state, formAction, pending] = useActionState(
    createSexoEncuentro,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="lugar_id">Lugar</Label>
        <Select name="lugar_id" defaultValue={lugares[0]?.id}>
          <SelectTrigger id="lugar_id" className="w-full">
            <SelectValue placeholder="Elige un lugar" />
          </SelectTrigger>
          <SelectContent>
            {lugares.map((lugar) => (
              <SelectItem key={lugar.id} value={lugar.id}>
                {lugar.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="fecha">Fecha</Label>
        <Input id="fecha" name="fecha" type="date" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="titulo">Título</Label>
        <Input id="titulo" name="titulo" required maxLength={200} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="notas">Notas (opcional)</Label>
        <Textarea id="notas" name="notas" rows={4} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="imagen">Foto (opcional)</Label>
        <Input id="imagen" name="imagen" type="file" accept="image/*" />
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending || lugares.length === 0}>
        {pending ? "Guardando…" : "Añadir encuentro"}
      </Button>
      {lugares.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Primero hay que crear un lugar.
        </p>
      )}
    </form>
  );
}
