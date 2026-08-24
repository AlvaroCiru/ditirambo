/**
 * Pruebas locales de normalización de provincias + punto-en-polígono.
 * Ejecutar: node scripts/test-sexo-map.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const geoPath = path.join(root, "public/geo/spain-provinces.geojson");

// Cargar helpers compilados no disponibles; reimplementación mínima alineada con spain-provinces.ts
function stripDiacritics(value) {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}
function fold(value) {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9/]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const NAMES = [
  "A Coruña",
  "Alacant/Alicante",
  "Albacete",
  "Almería",
  "Araba/Álava",
  "Asturias",
  "Badajoz",
  "Barcelona",
  "Bizkaia/Vizcaya",
  "Burgos",
  "Cantabria",
  "Castelló/Castellón",
  "Ceuta",
  "Ciudad Real",
  "Cuenca",
  "Cáceres",
  "Cádiz",
  "Córdoba",
  "Gipuzkoa/Guipúzcoa",
  "Girona",
  "Granada",
  "Guadalajara",
  "Huelva",
  "Huesca",
  "Illes Balears",
  "Jaén",
  "La Rioja",
  "Las Palmas",
  "León",
  "Lleida",
  "Lugo",
  "Madrid",
  "Melilla",
  "Murcia",
  "Málaga",
  "Navarra",
  "Ourense",
  "Palencia",
  "Pontevedra",
  "Salamanca",
  "Santa Cruz De Tenerife",
  "Segovia",
  "Sevilla",
  "Soria",
  "Tarragona",
  "Teruel",
  "Toledo",
  "Valladolid",
  "València/Valencia",
  "Zamora",
  "Zaragoza",
  "Ávila",
];

const aliases = new Map();
for (const name of NAMES) {
  aliases.set(fold(name), name);
  for (const part of name.split("/")) aliases.set(fold(part), name);
}
for (const [a, c] of [
  ["Community of Madrid", "Madrid"],
  ["Comunidad de Madrid", "Madrid"],
  ["Valencia", "València/Valencia"],
  ["Alicante", "Alacant/Alicante"],
  ["Baleares", "Illes Balears"],
  ["Islas Baleares", "Illes Balears"],
  ["Vizcaya", "Bizkaia/Vizcaya"],
]) {
  aliases.set(fold(a), c);
}

function normalize(raw) {
  if (!raw) return null;
  return aliases.get(fold(raw)) ?? null;
}

function pointInRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInFeature(lng, lat, feature) {
  const g = feature.geometry;
  if (!g) return false;
  const polys =
    g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
  for (const poly of polys) {
    if (!pointInRing(lng, lat, poly[0])) continue;
    let inHole = false;
    for (let i = 1; i < poly.length; i++) {
      if (pointInRing(lng, lat, poly[i])) inHole = true;
    }
    if (!inHole) return true;
  }
  return false;
}

function resolveProvince(lat, lng, features) {
  for (const f of features) {
    if (pointInFeature(lng, lat, f)) {
      return normalize(f.properties?.name) ?? f.properties?.name ?? null;
    }
  }
  return null;
}

const samples = [
  { name: "Madrid centro", lat: 40.4168, lng: -3.7038, expect: "Madrid" },
  { name: "Alcobendas (lugar prueba)", lat: 40.5994432, lng: -3.7155594, expect: "Madrid" },
  { name: "Barcelona", lat: 41.3874, lng: 2.1686, expect: "Barcelona" },
  { name: "Valencia", lat: 39.4699, lng: -0.3763, expect: "València/Valencia" },
  { name: "Málaga", lat: 36.7213, lng: -4.4214, expect: "Málaga" },
  { name: "Sevilla", lat: 37.3891, lng: -5.9845, expect: "Sevilla" },
  { name: "Palma", lat: 39.5696, lng: 2.6502, expect: "Illes Balears" },
  { name: "Bilbao", lat: 43.263, lng: -2.935, expect: "Bizkaia/Vizcaya" },
];

console.log("=== normalize aliases ===");
const aliasCases = [
  ["Community of Madrid", "Madrid"],
  ["Comunidad de Madrid", "Madrid"],
  ["Valencia", "València/Valencia"],
  ["Alicante", "Alacant/Alicante"],
];
let failed = 0;
for (const [input, expect] of aliasCases) {
  const got = normalize(input);
  const ok = got === expect;
  if (!ok) failed++;
  console.log(ok ? "OK" : "FAIL", input, "→", got, `(esperaba ${expect})`);
}

if (!fs.existsSync(geoPath)) {
  console.error("Falta", geoPath);
  process.exit(1);
}

const t0 = performance.now();
const geo = JSON.parse(fs.readFileSync(geoPath, "utf8"));
const loadMs = performance.now() - t0;
console.log(`\n=== GeoJSON load: ${loadMs.toFixed(1)}ms, features=${geo.features.length} ===`);

const t1 = performance.now();
console.log("\n=== point-in-polygon ===");
for (const s of samples) {
  const got = resolveProvince(s.lat, s.lng, geo.features);
  const ok = got === s.expect;
  if (!ok) failed++;
  console.log(ok ? "OK" : "FAIL", s.name, "→", got, `(esperaba ${s.expect})`);
}
const pipMs = performance.now() - t1;
console.log(`PIP ${samples.length} puntos: ${pipMs.toFixed(1)}ms`);

// Simular coloreado de N lugares
const fakePlaces = Array.from({ length: 80 }, (_, i) => samples[i % samples.length]);
const t2 = performance.now();
const visited = new Set();
for (const p of fakePlaces) {
  const key = resolveProvince(p.lat, p.lng, geo.features);
  if (key) visited.add(key);
}
const colorMs = performance.now() - t2;
console.log(
  `\n=== rendimiento coloreado 80 lugares → ${visited.size} provincias: ${colorMs.toFixed(1)}ms ===`,
);

if (failed > 0) {
  console.error(`\n${failed} fallos`);
  process.exit(1);
}
console.log("\nTodas las pruebas OK");
