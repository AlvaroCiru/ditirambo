"use client";

import dynamic from "next/dynamic";

const LocationPickerMap = dynamic(
  () =>
    import("@/components/sexo/sexo-maps").then((m) => m.LocationPickerMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[220px] items-center justify-center rounded-xl border border-border bg-card text-sm text-muted-foreground">
        Cargando mapa…
      </div>
    ),
  },
);

export function SexoLugarStaticMap({
  lat,
  lng,
}: {
  lat: number;
  lng: number;
}) {
  return (
    <LocationPickerMap
      lat={lat}
      lng={lng}
      onChange={() => {}}
      height={220}
      readOnly
    />
  );
}
