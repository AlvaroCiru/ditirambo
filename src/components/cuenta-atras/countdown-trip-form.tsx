"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import {
  createCountdownTrip,
  updateCountdownTrip,
  type CountdownFormState,
} from "@/lib/actions/countdown";
import { inferPaisCode } from "@/lib/countdown-meta";
import type { CountdownTrip } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: CountdownFormState = {};

export function CountdownTripForm({
  trip,
  usedImages = [],
}: {
  trip?: CountdownTrip;
  usedImages?: string[];
}) {
  const action = trip ? updateCountdownTrip : createCountdownTrip;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [destino, setDestino] = useState(trip?.destino ?? "");
  const [nombre, setNombre] = useState(trip?.nombre ?? "");
  const [paisCode, setPaisCode] = useState(trip?.pais_code ?? "");
  const [selectedExisting, setSelectedExisting] = useState<string | null>(
    null,
  );
  const [quitarImagen, setQuitarImagen] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {trip && <input type="hidden" name="id" value={trip.id} />}
      {selectedExisting && (
        <input type="hidden" name="imagen_url_existente" value={selectedExisting} />
      )}
      {quitarImagen && <input type="hidden" name="quitar_imagen" value="si" />}

      <div className="flex flex-col gap-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          name="nombre"
          required
          maxLength={200}
          placeholder="Serbia, Cogolludo…"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            if (!paisCode) {
              const inferred = inferPaisCode(destino, e.target.value);
              if (inferred) setPaisCode(inferred);
            }
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="inicio_fecha">Fecha de inicio</Label>
          <Input
            id="inicio_fecha"
            name="inicio_fecha"
            type="date"
            required
            defaultValue={trip?.inicio_fecha}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="inicio_hora">
            Hora <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="inicio_hora"
            name="inicio_hora"
            type="time"
            defaultValue={trip?.inicio_hora ?? undefined}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="fin_fecha">
          Fecha de vuelta <span className="text-muted-foreground">(opcional)</span>
        </Label>
        <Input
          id="fin_fecha"
          name="fin_fecha"
          type="date"
          defaultValue={trip?.fin_fecha ?? undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="destino">Destino</Label>
        <Input
          id="destino"
          name="destino"
          placeholder="País / ciudad / lugar"
          value={destino}
          onChange={(e) => {
            setDestino(e.target.value);
            const inferred = inferPaisCode(e.target.value, nombre);
            if (inferred) setPaisCode(inferred);
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="pais_code">
            País (código){" "}
            <span className="text-muted-foreground">— bandera</span>
          </Label>
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
          <Label htmlFor="emoji">
            Emoji <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Input
            id="emoji"
            name="emoji"
            maxLength={16}
            placeholder="✈️"
            defaultValue={trip?.emoji ?? undefined}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="nota">
          Nota <span className="text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="nota"
          name="nota"
          rows={4}
          defaultValue={trip?.nota ?? undefined}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="imagen">Fotografía de portada</Label>
        <Input
          id="imagen"
          name="imagen"
          type="file"
          accept="image/*"
          onChange={() => {
            setSelectedExisting(null);
            setQuitarImagen(false);
          }}
        />
        {trip?.imagen_url && !quitarImagen && !selectedExisting && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={quitarImagen}
              onChange={(e) => setQuitarImagen(e.target.checked)}
              className="size-4"
            />
            Quitar imagen actual
          </label>
        )}
      </div>

      {usedImages.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">
            O elegir una imagen ya usada
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {usedImages.map((url) => (
              <button
                key={url}
                type="button"
                onClick={() => {
                  setSelectedExisting(url === selectedExisting ? null : url);
                  setQuitarImagen(false);
                }}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md border ${
                  selectedExisting === url
                    ? "border-primary ring-2 ring-primary/40"
                    : "border-border"
                }`}
              >
                <Image src={url} alt="" fill sizes="96px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : trip ? "Guardar cambios" : "Añadir viaje"}
      </Button>
    </form>
  );
}
