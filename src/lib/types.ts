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
