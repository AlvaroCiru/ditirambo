"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { formatFechaCorta } from "@/lib/sexo-meta";
import { normalizeSpainProvince } from "@/lib/spain-provinces";
import type { SexoEncuentroConLugar, SexoLugarConStats } from "@/lib/types";

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
  lugar: SexoLugarConStats;
  regionKey: string | null;
};

async function loadProvinceFeatures(): Promise<GeoJSON.Feature[]> {
  const mod = await import("@/components/sexo/sexo-maps");
  return mod.getSpainProvinceFeatures();
}

export function SexoMapaClient({
  lugares,
  encuentros,
}: {
  lugares: SexoLugarConStats[];
  encuentros: SexoEncuentroConLugar[];
}) {
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
    const map = new Map<
      string,
      { key: string; label: string; lugarIds: Set<string>; encuentroIds: Set<string> }
    >();

    function ensure(key: string) {
      let row = map.get(key);
      if (!row) {
        row = {
          key,
          label: key,
          lugarIds: new Set(),
          encuentroIds: new Set(),
        };
        map.set(key, row);
      }
      return row;
    }

    for (const { lugar, regionKey } of resolved) {
      if (!regionKey) continue;
      if (lugar.estado !== "visitado" && lugar.encuentros_count <= 0) continue;
      ensure(regionKey).lugarIds.add(lugar.id);
    }

    for (const e of encuentros) {
      const match = resolved.find((r) => r.lugar.id === e.lugar.id);
      const key =
        match?.regionKey ??
        (mode === "espana"
          ? normalizeSpainProvince(e.lugar.provincia) ?? e.lugar.provincia
          : e.lugar.pais_code?.toUpperCase() ?? null);
      if (!key) continue;
      const row = ensure(key);
      row.lugarIds.add(e.lugar.id);
      row.encuentroIds.add(e.id);
    }

    return [...map.values()].map((r) => ({
      key: r.key,
      label: r.label,
      lugares: r.lugarIds.size,
      encuentros: r.encuentroIds.size,
    }));
  }, [resolved, encuentros, mode]);

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
        label: `${lugar.nombre}${lugar.encuentros_count ? ` · ${lugar.encuentros_count}` : ""}`,
        provinciaKey: lugar.provincia,
        paisKey: lugar.pais_code,
      }));
  }, [resolved, selected]);

  const selectedLugar = useMemo(
    () => lugares.find((l) => l.id === selectedLugarId) ?? null,
    [lugares, selectedLugarId],
  );

  const encuentrosDelLugar = useMemo(() => {
    if (!selectedLugarId) return [];
    return encuentros.filter((e) => e.lugar_id === selectedLugarId);
  }, [encuentros, selectedLugarId]);

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
          ? selectedLugar
            ? "Pulsa otro punto o vuelve atrás. Abajo están los encuentros del lugar."
            : "Puntos = lugares. Pulsa uno para ver sus encuentros."
          : mode === "espana"
            ? "Provincias visitadas en color. Pulsa una para ampliarla."
            : "Pulsa un país de la lista para ver sus lugares."}
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
              {r.key} · {r.lugares}
            </button>
          ))}
        </div>
      )}

      <SexoChoroplethMap
        mode={mode}
        regions={regions}
        markers={markers}
        selectedKey={selected}
        onSelectRegion={(key) => {
          setSelected(key);
          setSelectedLugarId(null);
        }}
        onSelectMarker={(id) => setSelectedLugarId(id)}
      />

      {selected && (
        <div className="flex flex-col gap-3">
          <h2 className="font-heading text-lg">{selected}</h2>
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
                    {lugar.encuentros_count} encuentro
                    {lugar.encuentros_count === 1 ? "" : "s"}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedLugar && (
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-heading text-xl">{selectedLugar.nombre}</h3>
              <p className="text-sm text-muted-foreground">
                {[selectedLugar.ciudad, selectedLugar.provincia, selectedLugar.pais_code]
                  .filter(Boolean)
                  .join(" · ") || selectedLugar.ubicacion_texto || "Sin ubicación"}
              </p>
            </div>
            <Link
              href={`/sexo/lugares/${selectedLugar.id}`}
              className="text-sm text-primary hover:underline"
            >
              Ver ficha
            </Link>
          </div>
          {encuentrosDelLugar.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay encuentros en este lugar.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {encuentrosDelLugar.map((e) => (
                <li
                  key={e.id}
                  className="rounded-lg border border-border/70 bg-background px-3 py-2"
                >
                  <p className="font-medium">{e.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFechaCorta(e.fecha)}
                  </p>
                  {e.notas && (
                    <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                      {e.notas}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
