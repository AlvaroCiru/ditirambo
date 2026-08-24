export type WorkType =
  | "pelicula"
  | "serie"
  | "anime"
  | "libro"
  | "album_musica"
  | "concierto"
  | "opera"
  | "arte"
  | "videojuego";

export type WorkStatus = "pendiente" | "en_curso" | "completado";

export interface Work {
  id: string;
  tipo: WorkType;
  titulo: string;
  autor_creador: string | null;
  anio: number | null;
  imagen_url: string | null;
  estado: WorkStatus;
  creado_por: string;
  creado_en: string;
}

export interface Review {
  id: string;
  work_id: string;
  user_id: string;
  nota: number | null;
  texto: string | null;
  recomendado_para: string | null;
  para_compartir: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  es_admin: boolean;
}

export type CitaCategoria =
  | "excursiones"
  | "operas"
  | "museos"
  | "conciertos"
  | "viajes"
  | "cine"
  | "restaurantes"
  | "hotel"
  | "bienestar"
  | "otros";

export type CitaEstado =
  | "propuesta"
  | "programada"
  | "finalizada"
  | "rechazada";

export interface Cita {
  id: string;
  titulo: string;
  descripcion: string | null;
  categoria: CitaCategoria;
  ubicacion: string;
  inicio_en: string;
  fin_en: string;
  imagen_url: string | null;
  /** Foto recuerdo tras la cita (opcional). */
  recuerdo_url: string | null;
  estado: CitaEstado;
  creado_por: string;
  aprobado_por: string | null;
  creado_en: string;
  actualizado_en: string;
}

export type NotificationTemplateKey =
  | "review_new"
  | "review_recommendation"
  | "review_shared"
  | "app_update"
  | "push_test"
  | "cita_propuesta"
  | "cita_aceptada";

export interface NotificationTemplate {
  id: string;
  key: NotificationTemplateKey | string;
  label: string;
  description: string;
  title_template: string;
  body_template: string;
  enabled: boolean;
  url_default: string;
  variables: string[];
  creado_en: string;
  actualizado_en: string;
}

export interface WorkWithReviews extends Work {
  reviews: Review[];
}

export type DevNoteStatus = "idea" | "por_hacer" | "en_curso" | "hecho";
export type DevNotePriority = "baja" | "media" | "alta";

export interface DevNote {
  id: string;
  /** Correlativo interno (1, 2, 3…). En UI se muestra como ID-001. */
  codigo: number;
  titulo: string;
  cuerpo: string;
  estado: DevNoteStatus;
  prioridad: DevNotePriority;
  creado_por: string;
  creado_en: string;
  actualizado_en: string;
}

/** Nota de actualización de producto (versión v.X.XX). */
export interface AppUpdate {
  id: string;
  version_major: number;
  version_minor: number;
  titulo: string;
  cuerpo: string;
  creado_por: string;
  creado_en: string;
  actualizado_en: string;
}
