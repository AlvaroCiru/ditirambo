import { z } from "zod";

export const countdownTripSchema = z
  .object({
    nombre: z.string().trim().min(1, "El nombre es obligatorio.").max(200),
    destino: z.string().trim().default(""),
    pais_code: z
      .string()
      .trim()
      .max(8)
      .optional()
      .transform((v) => {
        if (!v) return null;
        return v.toUpperCase();
      }),
    inicio_fecha: z
      .string()
      .min(1, "La fecha de inicio es obligatoria.")
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha no válida."),
    inicio_hora: z
      .string()
      .optional()
      .transform((v) => {
        if (!v || !v.trim()) return null;
        if (!/^\d{2}:\d{2}$/.test(v.trim())) return null;
        return v.trim();
      }),
    fin_fecha: z
      .string()
      .optional()
      .transform((v) => {
        if (!v || !v.trim()) return null;
        return v.trim();
      }),
    emoji: z
      .string()
      .trim()
      .max(16)
      .optional()
      .transform((v) => v || null),
    nota: z
      .string()
      .trim()
      .optional()
      .transform((v) => v || null),
    imagen_url_existente: z
      .string()
      .trim()
      .optional()
      .transform((v) => v || null),
  })
  .superRefine((data, ctx) => {
    if (data.fin_fecha && data.fin_fecha < data.inicio_fecha) {
      ctx.addIssue({
        code: "custom",
        message: "La fecha de vuelta no puede ser anterior a la de inicio.",
        path: ["fin_fecha"],
      });
    }
  });

export const countdownRemindersSchema = z.object({
  remind_30d: z.coerce.boolean().default(false),
  remind_7d: z.coerce.boolean().default(false),
  remind_1d: z.coerce.boolean().default(false),
  remind_hoy: z.coerce.boolean().default(false),
});
