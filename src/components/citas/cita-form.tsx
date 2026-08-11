"use client";

import { useActionState } from "react";
import { createCita, updateCita, type CitaFormState } from "@/lib/actions/citas";
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
import { CITA_CATEGORY_CONFIG, CITA_CATEGORY_ORDER } from "@/lib/cita-categories";
import { toDatetimeLocalValue } from "@/lib/cita-datetime";
import type { Cita } from "@/lib/types";

const initialState: CitaFormState = {};

export function CitaForm({ cita }: { cita?: Cita }) {
  const action = cita ? updateCita.bind(null, cita.id) : createCita;
  const [state, formAction, pending] = useActionState(action, initialState);

  const defaultInicio = cita
    ? toDatetimeLocalValue(cita.inicio_en)
    : "";
  const defaultFin = cita ? toDatetimeLocalValue(cita.fin_en) : "";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          name="titulo"
          required
          maxLength={200}
          defaultValue={cita?.titulo}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="categoria">Categoría</Label>
        <Select name="categoria" defaultValue={cita?.categoria ?? "excursiones"}>
          <SelectTrigger id="categoria" className="w-full">
            <SelectValue placeholder="Elige una categoría" />
          </SelectTrigger>
          <SelectContent>
            {CITA_CATEGORY_ORDER.map((categoria) => (
              <SelectItem key={categoria} value={categoria}>
                {CITA_CATEGORY_CONFIG[categoria].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="ubicacion">Ubicación</Label>
        <Input
          id="ubicacion"
          name="ubicacion"
          maxLength={300}
          placeholder="Sitio, ciudad, dirección…"
          defaultValue={cita?.ubicacion}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="inicio_en">Inicio</Label>
          <Input
            id="inicio_en"
            name="inicio_en"
            type="datetime-local"
            required
            defaultValue={defaultInicio}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fin_en">Fin</Label>
          <Input
            id="fin_en"
            name="fin_en"
            type="datetime-local"
            required
            defaultValue={defaultFin}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="descripcion">Descripción (opcional)</Label>
        <Textarea
          id="descripcion"
          name="descripcion"
          rows={4}
          maxLength={4000}
          defaultValue={cita?.descripcion ?? undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="imagen">
          Foto {cita ? "(déjalo vacío para no cambiarla)" : "(opcional)"}
        </Label>
        <Input id="imagen" name="imagen" type="file" accept="image/*" />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending
          ? "Guardando…"
          : cita
            ? "Guardar cambios"
            : "Proponer cita"}
      </Button>
    </form>
  );
}
