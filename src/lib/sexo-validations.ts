import { z } from "zod";
import type { SexoLugarTipo } from "@/lib/types";

export const SEXO_TIPO_VALUES = [
  "hotel",
  "casa",
  "apartamento",
  "exterior",
  "coche",
  "otros",
] as const satisfies readonly SexoLugarTipo[];

function optionalCoord(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

export const sexoLugarSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(200),
  tipo: z.enum(SEXO_TIPO_VALUES),
  fecha_primera: z
    .string()
    .min(1, "La fecha es obligatoria.")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha no válida."),
  ubicacion_texto: z.string().trim().default(""),
  lat: z.any().transform(optionalCoord),
  lng: z.any().transform(optionalCoord),
  pais_code: z
    .string()
    .trim()
    .max(8)
    .optional()
    .transform((v) => v || null),
  provincia: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => v || null),
  ciudad: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => v || null),
  comunidad_autonoma: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => v || null),
  nota: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || null),
  confirmar_duplicado: z
    .any()
    .optional()
    .transform((v) => v === "1" || v === "true" || v === true),
});

export const sexoCasaSchema = z.object({
  casa_lat: z.coerce.number().min(-90).max(90),
  casa_lng: z.coerce.number().min(-180).max(180),
});
