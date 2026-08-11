import { z } from "zod";
import { isValidRating, parseRating } from "./rating";
import type { WorkStatus, WorkType } from "./types";

export const WORK_TYPE_VALUES = [
  "pelicula",
  "serie",
  "anime",
  "libro",
  "album_musica",
  "concierto",
  "opera",
  "arte",
  "videojuego",
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
    .transform((v) => {
      const n = parseRating(v);
      return n == null ? undefined : n;
    })
    .refine(
      (v) => v === undefined || isValidRating(v),
      "La nota debe estar entre 0.5 y 10, en medios puntos.",
    ),
  texto: z
    .string()
    .trim()
    .max(4000)
    .optional()
    .transform((v) => v || undefined),
  recomendado: z.enum(["si", "no"]).nullish(),
  para_compartir: z.enum(["si", "no"]).nullish(),
});

export const statusSchema = z.enum(WORK_STATUS_VALUES);
