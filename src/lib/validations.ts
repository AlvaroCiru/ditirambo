import { z } from "zod";
import { isValidRating, parseRating } from "./rating";
import type { CitaCategoria, CitaEstado, WorkStatus, WorkType } from "./types";

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
    .optional()
    .transform((v) => v || undefined),
  recomendado: z.enum(["si", "no"]).nullish(),
  para_compartir: z.enum(["si", "no"]).nullish(),
});

export const statusSchema = z.enum(WORK_STATUS_VALUES);

export const CITA_CATEGORIA_VALUES = [
  "excursiones",
  "operas",
  "museos",
  "conciertos",
  "viajes",
  "cine",
  "restaurantes",
  "hotel",
  "bienestar",
  "otros",
] as const satisfies readonly CitaCategoria[];

export const CITA_ESTADO_VALUES = [
  "propuesta",
  "programada",
  "finalizada",
  "rechazada",
] as const satisfies readonly CitaEstado[];

function parseDateTimeLocal(value: unknown): Date | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date;
}

export const citaSchema = z
  .object({
    titulo: z.string().trim().min(1, "El título es obligatorio.").max(200),
    descripcion: z
      .string()
      .trim()
      .optional()
      .transform((v) => v || undefined),
    categoria: z.enum(CITA_CATEGORIA_VALUES),
    ubicacion: z.string().trim().default(""),
    inicio_en: z
      .string()
      .min(1, "La fecha de inicio es obligatoria.")
      .transform((v, ctx) => {
        const date = parseDateTimeLocal(v);
        if (!date) {
          ctx.addIssue({
            code: "custom",
            message: "La fecha de inicio no es válida.",
          });
          return z.NEVER;
        }
        return date.toISOString();
      }),
    fin_en: z
      .string()
      .min(1, "La fecha de fin es obligatoria.")
      .transform((v, ctx) => {
        const date = parseDateTimeLocal(v);
        if (!date) {
          ctx.addIssue({
            code: "custom",
            message: "La fecha de fin no es válida.",
          });
          return z.NEVER;
        }
        return date.toISOString();
      }),
  })
  .refine((data) => data.fin_en >= data.inicio_en, {
    message: "La fecha de fin debe ser igual o posterior al inicio.",
    path: ["fin_en"],
  });
