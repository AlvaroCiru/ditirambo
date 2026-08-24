import { z } from "zod";
import type { SexoLugarTipo } from "@/lib/types";

export const SEXO_TIPO_VALUES = [
  "hotel",
  "casa",
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
});

export const sexoEncuentroSchema = z.object({
  lugar_id: z.string().uuid("Elige un lugar."),
  fecha: z.string().min(1, "La fecha es obligatoria."),
  titulo: z.string().trim().min(1, "El título es obligatorio.").max(200),
  notas: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || undefined),
});

export const sexoSugerenciaSchema = z.object({
  titulo: z.string().trim().min(1, "El título es obligatorio.").max(200),
  notas: z
    .string()
    .trim()
    .optional()
    .transform((v) => v || undefined),
  tipo: z.enum(SEXO_TIPO_VALUES),
  ubicacion_texto: z.string().trim().default(""),
  lat: z.any().transform(optionalCoord),
  lng: z.any().transform(optionalCoord),
});

export const sexoCasaSchema = z.object({
  casa_lat: z.coerce.number().min(-90).max(90),
  casa_lng: z.coerce.number().min(-180).max(180),
});
