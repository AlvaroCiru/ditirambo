import type { DevNotePriority, DevNoteStatus } from "@/lib/types";

/** Formato fijo ID-001, ID-002, … */
export function formatNoteCodigo(codigo: number): string {
  return `ID-${String(codigo).padStart(3, "0")}`;
}

export const NOTE_STATUS_ORDER = [
  "idea",
  "por_hacer",
  "en_curso",
  "hecho",
] as const satisfies readonly DevNoteStatus[];

export const NOTE_STATUS_LABELS: Record<DevNoteStatus, string> = {
  idea: "Ideas",
  por_hacer: "Por hacer",
  en_curso: "En curso",
  hecho: "Hecho",
};

export const NOTE_PRIORITY_ORDER = [
  "alta",
  "media",
  "baja",
] as const satisfies readonly DevNotePriority[];

export const NOTE_PRIORITY_LABELS: Record<DevNotePriority, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

export const NOTE_PRIORITY_WEIGHT: Record<DevNotePriority, number> = {
  alta: 0,
  media: 1,
  baja: 2,
};
