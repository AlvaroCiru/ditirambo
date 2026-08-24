"use client";

import { useActionState, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import {
  resetSexoCasa,
  updateSexoCasa,
  type SexoFormState,
} from "@/lib/actions/sexo";
import { DEFAULT_HOME } from "@/lib/sexo-meta";
import { Button } from "@/components/ui/button";

const LocationPickerMap = dynamic(
  () =>
    import("@/components/sexo/sexo-maps").then((m) => m.LocationPickerMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[280px] items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
        Cargando mapa…
      </div>
    ),
  },
);

const initialState: SexoFormState = {};

export function SexoCasaForm({
  initialLat,
  initialLng,
}: {
  initialLat: number;
  initialLng: number;
}) {
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [state, formAction, pending] = useActionState(
    updateSexoCasa,
    initialState,
  );
  const [resetting, startReset] = useTransition();

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="casa_lat" value={lat} />
      <input type="hidden" name="casa_lng" value={lng} />
      <p className="text-sm text-muted-foreground">
        Arrastra el marcador o toca el mapa para fijar la casa. Se usa para
        calcular distancias en curiosidades.
      </p>
      <LocationPickerMap
        lat={lat}
        lng={lng}
        onChange={(nextLat, nextLng) => {
          setLat(nextLat);
          setLng(nextLng);
        }}
      />
      <p className="text-xs text-muted-foreground">
        {lat.toFixed(5)}, {lng.toFixed(5)}
      </p>
      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending || resetting}>
          {pending ? "Guardando…" : "Guardar casa"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending || resetting}
          onClick={() => {
            setLat(DEFAULT_HOME.lat);
            setLng(DEFAULT_HOME.lng);
            startReset(() => resetSexoCasa());
          }}
        >
          Restablecer default
        </Button>
      </div>
    </form>
  );
}
