import {
  Clapperboard,
  BookOpen,
  DiscAlbum,
  Theater,
  Palette,
  type LucideIcon,
} from "lucide-react";
import type { WorkStatus, WorkType } from "./types";

interface CategoryConfig {
  label: string;
  labelPlural: string;
  icon: LucideIcon;
}

export const CATEGORY_ORDER: WorkType[] = [
  "pelicula",
  "libro",
  "album_musica",
  "opera",
  "arte",
];

export const CATEGORY_CONFIG: Record<WorkType, CategoryConfig> = {
  pelicula: { label: "Película", labelPlural: "Películas", icon: Clapperboard },
  libro: { label: "Libro", labelPlural: "Libros", icon: BookOpen },
  album_musica: { label: "Álbum", labelPlural: "Álbumes", icon: DiscAlbum },
  opera: { label: "Ópera", labelPlural: "Óperas", icon: Theater },
  arte: { label: "Arte", labelPlural: "Arte", icon: Palette },
};

export const STATUS_ORDER: WorkStatus[] = ["pendiente", "en_curso", "completado"];

export const STATUS_LABELS: Record<WorkStatus, string> = {
  pendiente: "Pendiente",
  en_curso: "En curso",
  completado: "Completado",
};
