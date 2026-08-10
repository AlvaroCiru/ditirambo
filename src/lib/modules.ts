import {
  Star,
  CalendarDays,
  NotebookPen,
  type LucideIcon,
} from "lucide-react";

/**
 * Módulos de primer nivel en la barra lateral.
 * Añadir entradas aquí (y su carpeta bajo app/(protected)/) para nuevas áreas.
 */
export interface AppModule {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Prefijos de ruta que pertenecen a este módulo (para estado activo). */
  match: string[];
}

export const APP_MODULES: AppModule[] = [
  {
    id: "resenas",
    label: "Reseñas",
    href: "/resenas",
    icon: Star,
    match: ["/resenas"],
  },
  {
    id: "citas",
    label: "Planificador de citas",
    href: "/citas",
    icon: CalendarDays,
    match: ["/citas"],
  },
  {
    id: "notas",
    label: "Notas de desarrollo",
    href: "/notas",
    icon: NotebookPen,
    match: ["/notas"],
  },
];

export function moduleForPath(pathname: string): AppModule | undefined {
  return APP_MODULES.find((mod) =>
    mod.match.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ),
  );
}
