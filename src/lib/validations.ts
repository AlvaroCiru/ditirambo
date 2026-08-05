import { z } from "zod";
import type { WorkStatus, WorkType } from "./types";

export const WORK_TYPE_VALUES = [
  "pelicula",
  "libro",
  "album_musica",
  "opera",
  "arte",
] as const satisfies readonly WorkType[];

export const WORK_STATUS_VALUES = [
  "pendiente",
  "en_curso",
  "completado",
] as const satisfies readonly WorkStatus[];

export const workSchema = z.object({
  tipo: z.enum(WORK_TYPE_VALUES),
  titulo: z.string().trim().min(1, "El título es obligatorio.").max(200),
  autor_creador: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((v) => v || undefined),
  anio: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .refine(
      (v) => v === undefined || (Number.isInteger(v) && v > 0 && v < 3000),
      "El año no es válido.",
    ),
});

export const reviewSchema = z.object({
  nota: z
    .string()
    .optional()
    .transform((v) => (v ? Number(v) : undefined))
    .refine(
      (v) => v === undefined || (Number.isInteger(v) && v >= 1 && v <= 10),
      "La nota debe estar entre 1 y 10.",
    ),
  texto: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .transform((v) => v || undefined),
  recomendado: z.enum(["si", "no"]).nullish(),
});

export const statusSchema = z.enum(WORK_STATUS_VALUES);
