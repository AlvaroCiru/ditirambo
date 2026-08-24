"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  normalizeSpainProvince,
  pointInPolygonCoords,
  provinceNameFromFeature,
  type ProvinceFeatureProps,
} from "@/lib/spain-provinces";

const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

const SPAIN_GEO_URL = "/geo/spain-provinces.geojson";

let spainGeoCache: GeoJSON.FeatureCollection | null = null;
let spainGeoPromise: Promise<GeoJSON.FeatureCollection | null> | null = null;

async function loadSpainProvinces(): Promise<GeoJSON.FeatureCollection | null> {
  if (spainGeoCache) return spainGeoCache;
  if (!spainGeoPromise) {
    spainGeoPromise = fetch(SPAIN_GEO_URL)
      .then(async (res) => {
        if (!res.ok) return null;
        const data = (await res.json()) as GeoJSON.FeatureCollection;
        spainGeoCache = data;
        return data;
      })
      .catch(() => null);
  }
  return spainGeoPromise;
}

function fixDefaultIcon() {
  // Leaflet default icon paths break under bundlers.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

function featureCanonicalName(feature: GeoJSON.Feature | undefined): string {
  const raw = provinceNameFromFeature(
    feature?.properties as ProvinceFeatureProps | null,
  );
  return normalizeSpainProvince(raw) || raw || "Provincia";
}

export function LocationPickerMap({
  lat,
  lng,
  onChange,
  className,
  height = 280,
}: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  className?: string;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    fixDefaultIcon();

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 11,
      scrollWheelZoom: true,
    });
    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      onChangeRef.current(pos.lat, pos.lng);
    });
    map.on("click", (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      onChangeRef.current(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    const current = markerRef.current.getLatLng();
    if (
      Math.abs(current.lat - lat) > 1e-6 ||
      Math.abs(current.lng - lng) > 1e-6
    ) {
      markerRef.current.setLatLng([lat, lng]);
      mapRef.current.panTo([lat, lng]);
    }
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height, width: "100%", borderRadius: 12, zIndex: 0 }}
    />
  );
}

export type ChoroplethRegion = {
  key: string;
  label: string;
  lugares: number;
  encuentros: number;
};

export type MapMarker = {
  id: string;
  lat: number;
  lng: number;
  nombre: string;
  label?: string;
  provinciaKey?: string | null;
  paisKey?: string | null;
};

export function resolveProvinceKeyForPlace(place: {
  lat: number | null;
  lng: number | null;
  provincia: string | null;
  features?: GeoJSON.Feature[];
}): string | null {
  const fromName = normalizeSpainProvince(place.provincia);
  if (fromName) return fromName;
  if (
    place.lat == null ||
    place.lng == null ||
    !place.features ||
    place.features.length === 0
  ) {
    return place.provincia;
  }

  for (const feature of place.features) {
    const geom = feature.geometry;
    if (!geom || (geom.type !== "Polygon" && geom.type !== "MultiPolygon")) {
      continue;
    }
    if (
      pointInPolygonCoords(
        place.lng,
        place.lat,
        geom.coordinates as number[][][] | number[][][][],
        geom.type,
      )
    ) {
      const raw = provinceNameFromFeature(
        feature.properties as ProvinceFeatureProps | null,
      );
      return normalizeSpainProvince(raw) ?? (raw || null);
    }
  }
  return place.provincia;
}

export function SexoChoroplethMap({
  mode,
  regions,
  markers,
  onSelectRegion,
  onSelectMarker,
  selectedKey,
  className,
  height = 420,
}: {
  mode: "espana" | "mundo";
  regions: ChoroplethRegion[];
  markers: MapMarker[];
  onSelectRegion?: (key: string | null) => void;
  onSelectMarker?: (id: string) => void;
  selectedKey?: string | null;
  className?: string;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoLayerRef = useRef<L.GeoJSON | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const featureByNameRef = useRef<Map<string, L.Path>>(new Map());
  const regionsRef = useRef(regions);
  const selectedRef = useRef(selectedKey);
  const onSelectRef = useRef(onSelectRegion);
  const onMarkerRef = useRef(onSelectMarker);
  regionsRef.current = regions;
  selectedRef.current = selectedKey;
  onSelectRef.current = onSelectRegion;
  onMarkerRef.current = onSelectMarker;

  function styleForName(name: string): L.PathOptions {
    const stats = regionsRef.current.find((r) => r.key === name);
    const intensity = stats
      ? Math.min(0.85, 0.35 + stats.encuentros * 0.1)
      : 0.12;
    const isSelected = selectedRef.current === name;
    return {
      color: isSelected ? "#e0c060" : stats ? "#8fb0d9" : "#2b3a5a",
      weight: isSelected ? 2.5 : stats ? 1.4 : 0.8,
      fillColor: stats ? "#7196c9" : "#1a2438",
      fillOpacity: stats ? intensity : 0.28,
    };
  }

  function restyleAll() {
    for (const [name, lyr] of featureByNameRef.current) {
      lyr.setStyle(styleForName(name));
    }
  }

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    fixDefaultIcon();
    const map = L.map(containerRef.current, {
      center: mode === "espana" ? [40.4, -3.7] : [20, 0],
      zoom: mode === "espana" ? 6 : 2,
      scrollWheelZoom: true,
    });
    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map);
    markersLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Carga / descarga del choropleth solo al cambiar de modo.
  useEffect(() => {
    if (!mapRef.current) return;
    const mapInstance = mapRef.current;

    if (geoLayerRef.current) {
      mapInstance.removeLayer(geoLayerRef.current);
      geoLayerRef.current = null;
    }
    featureByNameRef.current.clear();

    let cancelled = false;

    async function loadGeo() {
      if (mode !== "espana") {
        mapInstance.setView([20, 0], 2);
        return;
      }

      const geojson = await loadSpainProvinces();
      if (cancelled || !mapRef.current || !geojson) return;

      const layer = L.geoJSON(geojson as GeoJSON.GeoJsonObject, {
        style: (feature) => styleForName(featureCanonicalName(feature)),
        onEachFeature: (feature, lyr) => {
          const name = featureCanonicalName(feature);
          featureByNameRef.current.set(name, lyr as L.Path);
          const stats = regionsRef.current.find((r) => r.key === name);
          lyr.bindTooltip(
            stats
              ? `${name}: ${stats.lugares} lugares · ${stats.encuentros} encuentros`
              : `${name}: sin visitas`,
          );
          lyr.on("click", () => onSelectRef.current?.(name));
        },
      });
      layer.addTo(mapInstance);
      geoLayerRef.current = layer;
      mapInstance.setView([40.4, -3.7], 6);
    }

    void loadGeo();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Restyle cuando cambian regiones o selección.
  useEffect(() => {
    restyleAll();
    for (const [name, lyr] of featureByNameRef.current) {
      const stats = regions.find((r) => r.key === name);
      lyr.bindTooltip(
        stats
          ? `${name}: ${stats.lugares} lugares · ${stats.encuentros} encuentros`
          : `${name}: sin visitas`,
      );
    }
  }, [regions, selectedKey]);

  // Zoom a provincia seleccionada (sin markers aún, o si no hay puntos).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || mode !== "espana") return;

    if (!selectedKey) {
      map.setView([40.4, -3.7], 6, { animate: true });
      return;
    }

    const selectedLayer = featureByNameRef.current.get(selectedKey);
    if (selectedLayer instanceof L.Polygon || selectedLayer instanceof L.Rectangle) {
      map.fitBounds(selectedLayer.getBounds(), {
        padding: [28, 28],
        maxZoom: 10,
        animate: true,
      });
    } else if (selectedLayer && "getBounds" in selectedLayer) {
      const bounds = (
        selectedLayer as L.Layer & { getBounds: () => L.LatLngBounds }
      ).getBounds();
      map.fitBounds(bounds, {
        padding: [28, 28],
        maxZoom: 10,
        animate: true,
      });
    }
  }, [selectedKey, mode]);

  useEffect(() => {
    const map = mapRef.current;
    const group = markersLayerRef.current;
    if (!map || !group) return;
    group.clearLayers();

    if (!selectedKey) return;

    for (const m of markers) {
      const marker = L.circleMarker([m.lat, m.lng], {
        radius: 9,
        color: "#e0c060",
        fillColor: "#7196c9",
        fillOpacity: 0.95,
        weight: 2,
      });
      marker.bindTooltip(m.label ?? m.nombre);
      marker.on("click", (e) => {
        L.DomEvent.stopPropagation(e);
        onMarkerRef.current?.(m.id);
      });
      group.addLayer(marker);
    }

    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.45), { maxZoom: 12, animate: true });
      }
    }
  }, [markers, selectedKey]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ height, width: "100%", borderRadius: 12, zIndex: 0 }}
    />
  );
}

/** Expone el cargador cacheado para resolver provincias en el cliente. */
export async function getSpainProvinceFeatures(): Promise<GeoJSON.Feature[]> {
  const data = await loadSpainProvinces();
  return data?.features ?? [];
}
