export type WorkType = "pelicula" | "libro" | "album_musica" | "opera" | "arte";

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
