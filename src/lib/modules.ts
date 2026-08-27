import {
  Star,
  CalendarDays,
  NotebookPen,
  BellRing,
  Flame,
  Hourglass,
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
  /** Si true, solo se muestra a perfiles con es_admin. */
  adminOnly?: boolean;
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
    id: "cuenta-atras",
    label: "Cuenta atrás",
    href: "/cuenta-atras",
    icon: Hourglass,
    match: ["/cuenta-atras"],
  },
  {
    id: "sexo",
    label: "Sexo",
    href: "/sexo",
    icon: Flame,
    match: ["/sexo"],
  },
  {
    id: "notas",
    label: "Notas de desarrollo",
    href: "/notas",
    icon: NotebookPen,
    match: ["/notas"],
  },
  {
    id: "avisos",
    label: "Centro de notificaciones",
    href: "/avisos",
    icon: BellRing,
    match: ["/avisos"],
    adminOnly: true,
  },
];

export function modulesForUser(isAdmin: boolean): AppModule[] {
  return APP_MODULES.filter((mod) => !mod.adminOnly || isAdmin);
}

export function moduleForPath(pathname: string): AppModule | undefined {
  return APP_MODULES.find((mod) =>
    mod.match.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ),
  );
}
