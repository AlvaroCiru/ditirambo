/**
 * Verifica normalización al “guardar” y coherencia de semillas [TEST].
 * Ejecutar: node scripts/test-sexo-save.mjs
 *
 * No escribe en BD: valida el contrato de nombres canónicos que usa createSexoLugar.
 */
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

const CANONICAL = new Set([
  "Madrid",
  "Barcelona",
  "València/Valencia",
  "Málaga",
  "Sevilla",
  "Illes Balears",
  "Bizkaia/Vizcaya",
]);

const aliases = new Map([
  [fold("Community of Madrid"), "Madrid"],
  [fold("Comunidad de Madrid"), "Madrid"],
  [fold("Madrid"), "Madrid"],
  [fold("Valencia"), "València/Valencia"],
  [fold("Alicante"), "Alacant/Alicante"],
  [fold("Baleares"), "Illes Balears"],
  [fold("Vizcaya"), "Bizkaia/Vizcaya"],
]);

function normalizeSpainProvince(raw) {
  if (!raw) return null;
  return aliases.get(fold(raw)) ?? (CANONICAL.has(raw) ? raw : null);
}

function prepareLugarPayload(input) {
  return {
    ...input,
    provincia: normalizeSpainProvince(input.provincia) ?? input.provincia,
    pais_code: input.pais_code?.toUpperCase() ?? null,
  };
}

const cases = [
  {
    input: { provincia: "Community of Madrid", pais_code: "es" },
    expect: { provincia: "Madrid", pais_code: "ES" },
  },
  {
    input: { provincia: "Valencia", pais_code: "ES" },
    expect: { provincia: "València/Valencia", pais_code: "ES" },
  },
  {
    input: { provincia: "Illes Balears", pais_code: "ES" },
    expect: { provincia: "Illes Balears", pais_code: "ES" },
  },
];

let failed = 0;
for (const c of cases) {
  const got = prepareLugarPayload(c.input);
  const ok =
    got.provincia === c.expect.provincia && got.pais_code === c.expect.pais_code;
  if (!ok) failed++;
  console.log(ok ? "OK" : "FAIL", c.input, "→", got);
}

if (failed) {
  console.error(`${failed} fallos de guardado`);
  process.exit(1);
}
console.log("Contrato de guardado OK");
