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
import { countryNameFromCode } from "@/lib/country-names";

const TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const TILE_ATTR =
  "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community";

const SPAIN_GEO_URL = "/geo/spain-provinces.geojson";
const WORLD_GEO_URL = "/geo/world-countries.geojson";

let spainGeoCache: GeoJSON.FeatureCollection | null = null;
let spainGeoPromise: Promise<GeoJSON.FeatureCollection | null> | null = null;
let worldGeoCache: GeoJSON.FeatureCollection | null = null;
let worldGeoPromise: Promise<GeoJSON.FeatureCollection | null> | null = null;

async function loadGeoJson(
  url: string,
): Promise<GeoJSON.FeatureCollection | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as GeoJSON.FeatureCollection;
  } catch {
    return null;
  }
}

async function loadSpainProvinces(): Promise<GeoJSON.FeatureCollection | null> {
  if (spainGeoCache) return spainGeoCache;
  if (!spainGeoPromise) {
    spainGeoPromise = loadGeoJson(SPAIN_GEO_URL).then((data) => {
      spainGeoCache = data;
      return data;
    });
  }
  return spainGeoPromise;
}

async function loadWorldCountries(): Promise<GeoJSON.FeatureCollection | null> {
  if (worldGeoCache) return worldGeoCache;
  if (!worldGeoPromise) {
    worldGeoPromise = loadGeoJson(WORLD_GEO_URL).then((data) => {
      worldGeoCache = data;
      return data;
    });
  }
  return worldGeoPromise;
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

function countryIsoFromFeature(feature: GeoJSON.Feature | undefined): string {
  const props = feature?.properties as { ISO_A2?: string } | null;
  return (props?.ISO_A2 ?? "").toUpperCase();
}

function regionKeyFromFeature(
  mode: "espana" | "mundo",
  feature: GeoJSON.Feature | undefined,
): string {
  return mode === "mundo"
    ? countryIsoFromFeature(feature)
    : featureCanonicalName(feature);
}

export function LocationPickerMap({
  lat,
  lng,
  onChange,
  className,
  height = 280,
  readOnly = false,
}: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  className?: string;
  height?: number;
  readOnly?: boolean;
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
      dragging: !readOnly,
      doubleClickZoom: !readOnly,
    });
    L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: !readOnly }).addTo(map);
    if (!readOnly) {
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        onChangeRef.current(pos.lat, pos.lng);
      });
      map.on("click", (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onChangeRef.current(e.latlng.lat, e.latlng.lng);
      });
    }

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
  href?: string;
  ciudad?: string | null;
  fecha?: string | null;
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
  binary = true,
  className,
  height = 420,
}: {
  mode: "espana" | "mundo";
  regions: ChoroplethRegion[];
  markers: MapMarker[];
  onSelectRegion?: (key: string | null) => void;
  onSelectMarker?: (id: string) => void;
  selectedKey?: string | null;
  /** Si true, color sí/no sin intensidad por cantidad. */
  binary?: boolean;
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
  const binaryRef = useRef(binary);
  const modeRef = useRef(mode);
  const onSelectRef = useRef(onSelectRegion);
  const onMarkerRef = useRef(onSelectMarker);
  regionsRef.current = regions;
  selectedRef.current = selectedKey;
  binaryRef.current = binary;
  modeRef.current = mode;
  onSelectRef.current = onSelectRegion;
  onMarkerRef.current = onSelectMarker;

  function displayNameForKey(key: string): string {
    return modeRef.current === "mundo" ? countryNameFromCode(key) : key;
  }

  function styleForName(name: string): L.PathOptions {
    const stats = regionsRef.current.find((r) => r.key === name);
    const isSelected = selectedRef.current === name;
    if (binaryRef.current) {
      return {
        color: isSelected ? "#e0c060" : stats ? "#8fb0d9" : "#2b3a5a",
        weight: isSelected ? 2.5 : stats ? 1.4 : 0.8,
        fillColor: stats ? "#7196c9" : "#1a2438",
        fillOpacity: stats ? 0.55 : 0.28,
      };
    }
    const intensity = stats
      ? Math.min(0.85, 0.35 + stats.encuentros * 0.1)
      : 0.12;
    return {
      color: isSelected ? "#e0c060" : stats ? "#8fb0d9" : "#2b3a5a",
      weight: isSelected ? 2.5 : stats ? 1.4 : 0.8,
      fillColor: stats ? "#7196c9" : "#1a2438",
      fillOpacity: stats ? intensity : 0.28,
    };
  }

  function tooltipForName(name: string): string {
    const label = displayNameForKey(name);
    const stats = regionsRef.current.find((r) => r.key === name);
    if (!stats) return `${label}: sin lugares`;
    return binaryRef.current
      ? `${label}: registrada`
      : `${label}: ${stats.lugares} lugares`;
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
      const geojson =
        mode === "espana"
          ? await loadSpainProvinces()
          : await loadWorldCountries();
      if (cancelled || !mapRef.current || !geojson) {
        if (mode === "mundo") mapInstance.setView([20, 0], 2);
        return;
      }

      const layer = L.geoJSON(geojson as GeoJSON.GeoJsonObject, {
        style: (feature) =>
          styleForName(regionKeyFromFeature(mode, feature)),
        onEachFeature: (feature, lyr) => {
          const key = regionKeyFromFeature(mode, feature);
          if (!key) return;
          featureByNameRef.current.set(key, lyr as L.Path);
          lyr.bindTooltip(tooltipForName(key));
          lyr.on("click", () => onSelectRef.current?.(key));
        },
      });
      layer.addTo(mapInstance);
      geoLayerRef.current = layer;
      if (mode === "espana") {
        mapInstance.setView([40.4, -3.7], 6);
      } else {
        mapInstance.setView([20, 0], 2);
      }
    }

    void loadGeo();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    restyleAll();
    for (const [name, lyr] of featureByNameRef.current) {
      lyr.bindTooltip(tooltipForName(name));
    }
  }, [regions, selectedKey, binary]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!selectedKey) {
      if (mode === "espana") {
        map.setView([40.4, -3.7], 6, { animate: true });
      } else {
        map.setView([20, 0], 2, { animate: true });
      }
      return;
    }

    const selectedLayer = featureByNameRef.current.get(selectedKey);
    if (selectedLayer instanceof L.Polygon || selectedLayer instanceof L.Rectangle) {
      map.fitBounds(selectedLayer.getBounds(), {
        padding: [28, 28],
        maxZoom: mode === "mundo" ? 6 : 10,
        animate: true,
      });
    } else if (selectedLayer && "getBounds" in selectedLayer) {
      const bounds = (
        selectedLayer as L.Layer & { getBounds: () => L.LatLngBounds }
      ).getBounds();
      map.fitBounds(bounds, {
        padding: [28, 28],
        maxZoom: mode === "mundo" ? 6 : 10,
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
      const lines = [
        `<strong>${m.nombre}</strong>`,
        m.ciudad ? m.ciudad : "",
        m.fecha ? m.fecha : "",
      ].filter(Boolean);
      marker.bindPopup(lines.join("<br/>"));
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
