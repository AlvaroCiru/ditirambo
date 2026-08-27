"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import {
  formatFechaCorta,
  formatLocalizacion,
} from "@/lib/sexo-meta";
import { countryNameFromCode } from "@/lib/country-names";
import { normalizeSpainProvince } from "@/lib/spain-provinces";
import type { SexoLugar } from "@/lib/types";
import type { ChoroplethRegion } from "@/components/sexo/sexo-maps";

const SexoChoroplethMap = dynamic(
  () =>
    import("@/components/sexo/sexo-maps").then((m) => m.SexoChoroplethMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[420px] items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
        Cargando mapa…
      </div>
    ),
  },
);

type PlaceKey = {
  lugar: SexoLugar;
  regionKey: string | null;
};

async function loadProvinceFeatures(): Promise<GeoJSON.Feature[]> {
  const mod = await import("@/components/sexo/sexo-maps");
  return mod.getSpainProvinceFeatures();
}

export function SexoMapaClient({ lugares }: { lugares: SexoLugar[] }) {
  const [mode, setMode] = useState<"espana" | "mundo">("espana");
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedLugarId, setSelectedLugarId] = useState<string | null>(null);
  const [placeKeys, setPlaceKeys] = useState<PlaceKey[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSelected(null);
    setSelectedLugarId(null);

    async function resolve() {
      if (mode === "mundo") {
        const keys = lugares.map((lugar) => ({
          lugar,
          regionKey: lugar.pais_code?.toUpperCase() ?? null,
        }));
        if (!cancelled) setPlaceKeys(keys);
        return;
      }

      const features = await loadProvinceFeatures();
      const { resolveProvinceKeyForPlace } = await import(
        "@/components/sexo/sexo-maps"
      );
      const keys = lugares.map((lugar) => ({
        lugar,
        regionKey: resolveProvinceKeyForPlace({
          lat: lugar.lat,
          lng: lugar.lng,
          provincia: lugar.provincia,
          features,
        }),
      }));
      if (!cancelled) setPlaceKeys(keys);
    }

    void resolve();
    return () => {
      cancelled = true;
    };
  }, [lugares, mode]);

  const resolved =
    placeKeys ??
    lugares.map((lugar) => ({
      lugar,
      regionKey:
        mode === "mundo"
          ? lugar.pais_code?.toUpperCase() ?? null
          : normalizeSpainProvince(lugar.provincia) ?? lugar.provincia,
    }));

  const regions = useMemo(() => {
    const map = new Map<string, ChoroplethRegion>();
    for (const { lugar, regionKey } of resolved) {
      if (!regionKey) continue;
      const row = map.get(regionKey) ?? {
        key: regionKey,
        label:
          mode === "mundo"
            ? countryNameFromCode(regionKey)
            : regionKey,
        lugares: 0,
        encuentros: 0,
      };
      row.lugares += 1;
      map.set(regionKey, row);
    }
    const list = [...map.values()];
    if (mode === "mundo") {
      list.sort((a, b) => a.label.localeCompare(b.label, "es"));
    }
    return list;
  }, [resolved, mode]);

  const markers = useMemo(() => {
    if (!selected) return [];
    return resolved
      .filter(({ lugar, regionKey }) => {
        if (regionKey !== selected) return false;
        return lugar.lat != null && lugar.lng != null;
      })
      .map(({ lugar }) => ({
        id: lugar.id,
        lat: lugar.lat!,
        lng: lugar.lng!,
        nombre: lugar.nombre,
        label: `${lugar.nombre} · ${formatFechaCorta(lugar.fecha_primera)}`,
        href: `/sexo/lugares/${lugar.id}`,
        ciudad: lugar.ciudad,
        fecha: lugar.fecha_primera,
      }));
  }, [resolved, selected]);

  const selectedLugar = useMemo(
    () => lugares.find((l) => l.id === selectedLugarId) ?? null,
    [lugares, selectedLugarId],
  );

  const carousel = useMemo(() => {
    if (!selected) return [];
    return resolved
      .filter(({ regionKey }) => regionKey === selected)
      .map(({ lugar }) => lugar);
  }, [resolved, selected]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {(["espana", "mundo"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setMode(value);
              setSelected(null);
              setSelectedLugarId(null);
            }}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              mode === value
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {value === "espana" ? "España" : "Mundo"}
          </button>
        ))}
        {selected && (
          <button
            type="button"
            className="ml-auto text-sm text-muted-foreground hover:text-foreground"
            onClick={() => {
              setSelected(null);
              setSelectedLugarId(null);
            }}
          >
            ← Volver al mapa
          </button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        {selected
          ? "Puntos = lugares. Pulsa uno para ver el detalle."
          : mode === "espana"
            ? "Provincias con al menos un lugar. Pulsa una para ampliarla."
            : "Países con al menos un lugar. Pulsa uno para ampliarlo."}
      </p>

      {mode === "mundo" && !selected && regions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {regions.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => {
                setSelected(r.key);
                setSelectedLugarId(null);
              }}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:border-primary"
            >
              {r.label}
            </button>
          ))}
        </div>
      )}

      <SexoChoroplethMap
        mode={mode}
        regions={regions}
        markers={markers}
        selectedKey={selected}
        binary
        onSelectRegion={(key) => {
          setSelected(key);
          setSelectedLugarId(null);
        }}
        onSelectMarker={(id) => setSelectedLugarId(id)}
      />

      {selected && (
        <div className="flex flex-col gap-3">
          <h2 className="font-heading text-lg">
            {mode === "mundo" ? countryNameFromCode(selected) : selected}
          </h2>
          {carousel.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay lugares en esta zona.
            </p>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {carousel.map((lugar) => (
                <button
                  key={lugar.id}
                  type="button"
                  onClick={() => setSelectedLugarId(lugar.id)}
                  className={cn(
                    "w-48 shrink-0 rounded-xl border bg-card p-3 text-left transition-colors",
                    selectedLugarId === lugar.id
                      ? "border-primary"
                      : "border-border hover:border-primary/60",
                  )}
                >
                  {lugar.imagen_url && (
                    <div className="relative mb-2 aspect-video overflow-hidden rounded-md bg-background">
                      <Image
                        src={lugar.imagen_url}
                        alt=""
                        fill
                        sizes="192px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p className="truncate font-medium">{lugar.nombre}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFechaCorta(lugar.fecha_primera)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedLugar && (
        <section className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-heading text-xl">{selectedLugar.nombre}</h3>
              <p className="text-sm text-muted-foreground">
                {formatLocalizacion(selectedLugar)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatFechaCorta(selectedLugar.fecha_primera)}
              </p>
            </div>
            <Link
              href={`/sexo/lugares/${selectedLugar.id}`}
              className="text-sm text-primary hover:underline"
            >
              Abrir ficha
            </Link>
          </div>
          {selectedLugar.nota && (
            <p className="line-clamp-4 text-sm text-muted-foreground">
              {selectedLugar.nota}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
