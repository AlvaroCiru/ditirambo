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
  /** Código ISO país para bandera en Cuenta atrás (viajes). */
  pais_code: string | null;
  emoji: string | null;
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
  | "cita_aceptada"
  | "dev_note_new";

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

export type SexoLugarTipo =
  | "hotel"
  | "casa"
  | "apartamento"
  | "exterior"
  | "coche"
  | "otros";

export type SexoLugarEstado = "visitado" | "pendiente";

export type SexoSugerenciaEstado = "propuesta" | "aceptada" | "rechazada";

export interface SexoSettings {
  id: string;
  clave: string;
  casa_lat: number;
  casa_lng: number;
  actualizado_en: string;
}

export interface SexoLugar {
  id: string;
  nombre: string;
  tipo: SexoLugarTipo;
  ubicacion_texto: string;
  lat: number | null;
  lng: number | null;
  pais_code: string | null;
  provincia: string | null;
  ciudad: string | null;
  comunidad_autonoma: string | null;
  fecha_primera: string;
  nota: string | null;
  imagen_url: string | null;
  estado: SexoLugarEstado;
  creado_por: string;
  creado_en: string;
  actualizado_en: string;
}

/** @deprecated Encuentros dejaron de usarse en el rediseño ID-006. */
export interface SexoEncuentro {
  id: string;
  lugar_id: string;
  fecha: string;
  titulo: string;
  notas: string | null;
  imagen_url: string | null;
  creado_por: string;
  creado_en: string;
  actualizado_en: string;
}

/** @deprecated */
export interface SexoEncuentroConLugar extends SexoEncuentro {
  lugar: SexoLugar;
}

export type SexoLugarConStats = SexoLugar;

/** @deprecated */
export interface SexoSugerencia {
  id: string;
  titulo: string;
  notas: string | null;
  tipo: SexoLugarTipo;
  ubicacion_texto: string;
  lat: number | null;
  lng: number | null;
  imagen_url: string | null;
  estado: SexoSugerenciaEstado;
  propuesto_por: string;
  creado_en: string;
  actualizado_en: string;
}

export interface CountdownTrip {
  id: string;
  nombre: string;
  destino: string;
  pais_code: string | null;
  inicio_fecha: string;
  inicio_hora: string | null;
  fin_fecha: string | null;
  emoji: string | null;
  nota: string | null;
  imagen_url: string | null;
  creado_por: string;
  creado_en: string;
  actualizado_en: string;
}

export interface CountdownTripReminder {
  id: string;
  trip_id: string;
  user_id: string;
  remind_30d: boolean;
  remind_7d: boolean;
  remind_1d: boolean;
  remind_hoy: boolean;
  actualizado_en: string;
}
