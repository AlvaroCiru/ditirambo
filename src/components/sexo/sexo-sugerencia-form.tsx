"use client";

import { useActionState, useState } from "react";
import dynamic from "next/dynamic";
import { AddressAutocomplete } from "@/components/sexo/address-autocomplete";
import { createSexoSugerencia, type SexoFormState } from "@/lib/actions/sexo";
import {
  SEXO_TIPO_LABEL_SINGULAR,
  SEXO_TIPO_ORDER,
} from "@/lib/sexo-meta";
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

const LocationPickerMap = dynamic(
  () =>
    import("@/components/sexo/sexo-maps").then((m) => m.LocationPickerMap),
  { ssr: false },
);

const initialState: SexoFormState = {};

export function SexoSugerenciaForm() {
  const [state, formAction, pending] = useActionState(
    createSexoSugerencia,
    initialState,
  );
  const [lat, setLat] = useState(40.4168);
  const [lng, setLng] = useState(-3.7038);
  const [useMap, setUseMap] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="titulo">Título</Label>
        <Input id="titulo" name="titulo" required maxLength={200} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="tipo">Tipo</Label>
        <Select name="tipo" defaultValue="hotel">
          <SelectTrigger id="tipo" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SEXO_TIPO_ORDER.map((tipo) => (
              <SelectItem key={tipo} value={tipo}>
                {SEXO_TIPO_LABEL_SINGULAR[tipo]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AddressAutocomplete
        onSelect={(result) => {
          setUseMap(true);
          setLat(result.lat);
          setLng(result.lng);
        }}
      />

      <div className="flex flex-col gap-2">
        <Label htmlFor="notas">Notas</Label>
        <Textarea id="notas" name="notas" rows={3} />
      </div>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={useMap}
          onChange={(e) => setUseMap(e.target.checked)}
          className="size-4 rounded border-border"
        />
        Añadir punto en el mapa
      </label>
      {useMap && (
        <>
          <input type="hidden" name="lat" value={lat} />
          <input type="hidden" name="lng" value={lng} />
          <LocationPickerMap
            lat={lat}
            lng={lng}
            onChange={(a, b) => {
              setLat(a);
              setLng(b);
            }}
            height={220}
          />
        </>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="imagen">Foto (opcional)</Label>
        <Input id="imagen" name="imagen" type="file" accept="image/*" />
      </div>
      {state?.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Enviando…" : "Proponer"}
      </Button>
    </form>
  );
}
