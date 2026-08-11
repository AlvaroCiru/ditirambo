import {
  Mountain,
  Theater,
  Landmark,
  Mic2,
  Plane,
  Clapperboard,
  UtensilsCrossed,
  Hotel,
  HeartPulse,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import type { CitaCategoria, CitaEstado } from "./types";

interface CitaCategoryConfig {
  label: string;
  icon: LucideIcon;
}

export const CITA_CATEGORY_ORDER: CitaCategoria[] = [
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
];

export const CITA_CATEGORY_CONFIG: Record<CitaCategoria, CitaCategoryConfig> = {
  excursiones: { label: "Excursiones", icon: Mountain },
  operas: { label: "Óperas", icon: Theater },
  museos: { label: "Museos", icon: Landmark },
  conciertos: { label: "Conciertos", icon: Mic2 },
  viajes: { label: "Viajes", icon: Plane },
  cine: { label: "Cine", icon: Clapperboard },
  restaurantes: { label: "Restaurantes", icon: UtensilsCrossed },
  hotel: { label: "Hotel", icon: Hotel },
  bienestar: { label: "Bienestar", icon: HeartPulse },
  otros: { label: "Otros", icon: MoreHorizontal },
};

export const CITA_STATUS_ORDER: CitaEstado[] = [
  "propuesta",
  "programada",
  "finalizada",
];

export const CITA_STATUS_LABELS: Record<CitaEstado, string> = {
  propuesta: "Propuesta",
  programada: "Programada",
  finalizada: "Finalizada",
  rechazada: "Rechazada",
};
