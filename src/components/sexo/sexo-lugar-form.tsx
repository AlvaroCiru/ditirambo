"use client";

import { useActionState, useState } from "react";
import dynamic from "next/dynamic";
import { AddressAutocomplete } from "@/components/sexo/address-autocomplete";
import { createSexoLugar, type SexoFormState } from "@/lib/actions/sexo";
import {
  SEXO_TIPO_LABEL_SINGULAR,
  SEXO_TIPO_ORDER,
} from "@/lib/sexo-meta";
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

const LocationPickerMap = dynamic(
  () =>
    import("@/components/sexo/sexo-maps").then((m) => m.LocationPickerMap),
  { ssr: false },
);

const initialState: SexoFormState = {};

export function SexoLugarForm() {
  const [state, formAction, pending] = useActionState(
    createSexoLugar,
    initialState,
  );
  const [lat, setLat] = useState(40.4168);
  const [lng, setLng] = useState(-3.7038);
  const [useMap, setUseMap] = useState(true);
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [paisCode, setPaisCode] = useState("ES");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" name="nombre" required maxLength={200} />
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
          setCiudad(result.ciudad ?? "");
          setProvincia(result.provincia ?? "");
          setPaisCode(result.pais_code ?? "ES");
        }}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="ciudad">Ciudad</Label>
          <Input
            id="ciudad"
            name="ciudad"
            maxLength={120}
            value={ciudad}
            onChange={(e) => setCiudad(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="provincia">Provincia</Label>
          <Input
            id="provincia"
            name="provincia"
            maxLength={120}
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="pais_code">País (código)</Label>
          <Input
            id="pais_code"
            name="pais_code"
            maxLength={8}
            placeholder="ES"
            value={paisCode}
            onChange={(e) => setPaisCode(e.target.value)}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={useMap}
          onChange={(e) => setUseMap(e.target.checked)}
          className="size-4 rounded border-border"
        />
        Fijar punto en el mapa
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
        {pending ? "Guardando…" : "Crear lugar"}
      </Button>
    </form>
  );
}
