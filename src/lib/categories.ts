import {
  Clapperboard,
  BookOpen,
  DiscAlbum,
  Theater,
  Palette,
  Tv,
  Sparkles,
  Mic2,
  Gamepad2,
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
  "serie",
  "anime",
  "libro",
  "album_musica",
  "concierto",
  "opera",
  "arte",
  "videojuego",
];

export const CATEGORY_CONFIG: Record<WorkType, CategoryConfig> = {
  pelicula: { label: "Película", labelPlural: "Películas", icon: Clapperboard },
  serie: { label: "Serie", labelPlural: "Series", icon: Tv },
  anime: { label: "Anime", labelPlural: "Anime", icon: Sparkles },
  libro: { label: "Libro", labelPlural: "Libros", icon: BookOpen },
  album_musica: { label: "Álbum", labelPlural: "Álbumes", icon: DiscAlbum },
  concierto: { label: "Concierto", labelPlural: "Conciertos", icon: Mic2 },
  opera: { label: "Ópera", labelPlural: "Óperas", icon: Theater },
  arte: { label: "Arte", labelPlural: "Arte", icon: Palette },
  videojuego: {
    label: "Videojuego",
    labelPlural: "Videojuegos",
    icon: Gamepad2,
  },
};

export const STATUS_ORDER: WorkStatus[] = ["pendiente", "en_curso", "completado"];

export const STATUS_LABELS: Record<WorkStatus, string> = {
  pendiente: "Pendiente",
  en_curso: "En curso",
  completado: "Completado",
};
