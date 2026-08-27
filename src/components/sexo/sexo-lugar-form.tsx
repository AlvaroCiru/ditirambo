"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { AddressAutocomplete } from "@/components/sexo/address-autocomplete";
import {
  createSexoLugar,
  updateSexoLugar,
  type SexoFormState,
} from "@/lib/actions/sexo";
import {
  comunidadFromProvincia,
  SEXO_TIPO_LABEL_SINGULAR,
  SEXO_TIPO_ORDER,
} from "@/lib/sexo-meta";
import type { SexoLugar } from "@/lib/types";
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

function todayIso() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function SexoLugarForm({
  lugar,
}: {
  lugar?: SexoLugar;
}) {
  const action = lugar ? updateSexoLugar : createSexoLugar;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [lat, setLat] = useState(lugar?.lat ?? 40.4168);
  const [lng, setLng] = useState(lugar?.lng ?? -3.7038);
  const [useMap, setUseMap] = useState(
    lugar ? lugar.lat != null && lugar.lng != null : true,
  );
  const [ciudad, setCiudad] = useState(lugar?.ciudad ?? "");
  const [provincia, setProvincia] = useState(lugar?.provincia ?? "");
  const [comunidad, setComunidad] = useState(
    lugar?.comunidad_autonoma ?? "",
  );
  const [paisCode, setPaisCode] = useState(lugar?.pais_code ?? "ES");
  const [forceDup, setForceDup] = useState(false);

  const showDupWarning = Boolean(state?.duplicates?.length) && !forceDup;

  const sugerida = useMemo(
    () => comunidadFromProvincia(provincia),
    [provincia],
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {lugar && <input type="hidden" name="id" value={lugar.id} />}
      {forceDup && <input type="hidden" name="confirmar_duplicado" value="1" />}

      <div className="flex flex-col gap-2">
        <Label htmlFor="nombre">Nombre del lugar</Label>
        <Input
          id="nombre"
          name="nombre"
          required
          maxLength={200}
          defaultValue={lugar?.nombre}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="fecha_primera">Primera vez</Label>
        <Input
          id="fecha_primera"
          name="fecha_primera"
          type="date"
          required
          defaultValue={lugar?.fecha_primera ?? todayIso()}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tipo" className="text-muted-foreground">
          Tipo <span className="text-xs">(secundario)</span>
        </Label>
        <Select name="tipo" defaultValue={lugar?.tipo ?? "otros"}>
          <SelectTrigger id="tipo" className="w-full max-w-xs">
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
        defaultValue={lugar?.ubicacion_texto ?? ""}
        onSelect={(result) => {
          setUseMap(true);
          setLat(result.lat);
          setLng(result.lng);
          setCiudad(result.ciudad ?? "");
          setProvincia(result.provincia ?? "");
          setComunidad(comunidadFromProvincia(result.provincia) ?? "");
          setPaisCode(result.pais_code ?? "ES");
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="ciudad">Localidad / ciudad</Label>
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
            onChange={(e) => {
              setProvincia(e.target.value);
              const c = comunidadFromProvincia(e.target.value);
              if (c) setComunidad(c);
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="comunidad_autonoma">Comunidad autónoma</Label>
          <Input
            id="comunidad_autonoma"
            name="comunidad_autonoma"
            maxLength={120}
            value={comunidad}
            onChange={(e) => setComunidad(e.target.value)}
            placeholder={sugerida ?? undefined}
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
        <Label htmlFor="nota">Nota o recuerdo (opcional)</Label>
        <Textarea
          id="nota"
          name="nota"
          rows={8}
          defaultValue={lugar?.nota ?? undefined}
          placeholder="Un recuerdo asociado a este lugar…"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="imagen">
          Fotografía {lugar?.imagen_url ? "(sustituir)" : "(opcional)"}
        </Label>
        <Input id="imagen" name="imagen" type="file" accept="image/*" />
      </div>

      {showDupWarning && (
        <div
          role="alert"
          className="rounded-xl border border-border bg-card p-4 text-sm"
        >
          <p className="font-medium">¿Este lugar ya existe?</p>
          <ul className="mt-2 flex flex-col gap-1">
            {state.duplicates!.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/sexo/lugares/${d.id}`}
                  className="text-primary underline-offset-2 hover:underline"
                >
                  {d.nombre}
                  {d.ciudad ? ` · ${d.ciudad}` : ""}
                </Link>
              </li>
            ))}
          </ul>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setForceDup(true)}
          >
            Confirmar que es otro lugar
          </Button>
          {forceDup && (
            <p className="mt-2 text-xs text-muted-foreground">
              Pulsa de nuevo «Guardar» para crear el lugar.
            </p>
          )}
        </div>
      )}

      {state?.error && !showDupWarning && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending}>
        {pending
          ? "Guardando…"
          : lugar
            ? "Guardar cambios"
            : forceDup
              ? "Crear de todas formas"
              : "Añadir lugar"}
      </Button>
    </form>
  );
}
