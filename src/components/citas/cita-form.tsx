"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
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
import { inferPaisCode } from "@/lib/countdown-meta";
import type { Cita, CitaCategoria } from "@/lib/types";

const initialState: CitaFormState = {};

export function CitaForm({ cita }: { cita?: Cita }) {
  const action = cita ? updateCita.bind(null, cita.id) : createCita;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [categoria, setCategoria] = useState<CitaCategoria>(
    cita?.categoria ?? "excursiones",
  );
  const [titulo, setTitulo] = useState(cita?.titulo ?? "");
  const [ubicacion, setUbicacion] = useState(cita?.ubicacion ?? "");
  const [paisCode, setPaisCode] = useState(cita?.pais_code ?? "");

  const defaultInicio = cita
    ? toDatetimeLocalValue(cita.inicio_en)
    : "";
  const defaultFin = cita ? toDatetimeLocalValue(cita.fin_en) : "";
  const esViaje = categoria === "viajes";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          name="titulo"
          required
          maxLength={200}
          value={titulo}
          onChange={(e) => {
            setTitulo(e.target.value);
            if (esViaje && !paisCode) {
              const inferred = inferPaisCode(ubicacion, e.target.value);
              if (inferred) setPaisCode(inferred);
            }
          }}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="categoria">Categoría</Label>
        <Select
          name="categoria"
          value={categoria}
          onValueChange={(value) => {
            if (value) setCategoria(value as CitaCategoria);
          }}
        >
          <SelectTrigger id="categoria" className="w-full">
            <SelectValue placeholder="Elige una categoría" />
          </SelectTrigger>
          <SelectContent>
            {CITA_CATEGORY_ORDER.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CITA_CATEGORY_CONFIG[cat].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="ubicacion">
          {esViaje ? "Destino / ubicación" : "Ubicación"}
        </Label>
        <Input
          id="ubicacion"
          name="ubicacion"
          placeholder={
            esViaje
              ? "País, ciudad, región…"
              : "Sitio, ciudad, dirección…"
          }
          value={ubicacion}
          onChange={(e) => {
            setUbicacion(e.target.value);
            if (esViaje) {
              const inferred = inferPaisCode(e.target.value, titulo);
              if (inferred) setPaisCode(inferred);
            }
          }}
        />
      </div>

      {esViaje && (
        <div className="grid gap-4 rounded-xl border border-border bg-card/50 p-4 sm:grid-cols-2">
          <p className="sm:col-span-2 text-xs text-muted-foreground">
            Estos datos aparecen en la pestaña Cuenta atrás (días restantes y
            bandera).
          </p>
          <div className="flex flex-col gap-2">
            <Label htmlFor="pais_code">País (código ISO)</Label>
            <Input
              id="pais_code"
              name="pais_code"
              maxLength={8}
              placeholder="ES, RS, US…"
              value={paisCode}
              onChange={(e) => setPaisCode(e.target.value.toUpperCase())}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="emoji">Emoji (opcional)</Label>
            <Input
              id="emoji"
              name="emoji"
              maxLength={16}
              placeholder="✈️"
              defaultValue={cita?.emoji ?? undefined}
            />
          </div>
        </div>
      )}

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
          rows={8}
          defaultValue={cita?.descripcion ?? undefined}
        />
        <p className="text-xs text-muted-foreground">
          Sin límite de caracteres (planes largos, avisos, presupuestos…).
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="imagen">
          Foto{" "}
          {esViaje
            ? "de portada (Cuenta atrás)"
            : cita
              ? "(déjalo vacío para no cambiarla)"
              : "(opcional)"}
        </Label>
        {cita?.imagen_url && (
          <div className="flex items-start gap-3">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-background">
              <Image
                src={cita.imagen_url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                name="quitar_imagen"
                value="si"
                className="size-4 rounded border-border"
              />
              Eliminar foto actual
            </label>
          </div>
        )}
        <Input id="imagen" name="imagen" type="file" accept="image/*" />
      </div>

      {cita && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="recuerdo">
            Foto recuerdo post-cita
            {cita.recuerdo_url
              ? " (déjalo vacío para no cambiarla)"
              : " (opcional)"}
          </Label>
          {cita.recuerdo_url && (
            <div className="flex items-start gap-3">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-background">
                <Image
                  src={cita.recuerdo_url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  name="quitar_recuerdo"
                  value="si"
                  className="size-4 rounded border-border"
                />
                Eliminar recuerdo actual
              </label>
            </div>
          )}
          <Input id="recuerdo" name="recuerdo" type="file" accept="image/*" />
        </div>
      )}

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
