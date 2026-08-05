/**
 * Paleta azulada inspirada en la versión real de Kandinsky (Colección Carmen
 * Thyssen-Bornemisza) de "Murnau, casas en el Obermarkt": azul noche
 * dominante, con violeta, terracota, ocre y verde como acentos. Se usa tanto
 * en el tema CSS (globals.css) como en la marca generada para iconos/PWA,
 * para que un único cambio aquí se propague a toda la identidad visual.
 */
export const PALETTE = {
  // Fondo claro y tonos usados solo para el icono/marca de la app (se
  // mantienen claros para que el icono destaque en cualquier launcher).
  paper: "#eaeef2",
  ink: "#1b2430",
  indigo: "#2d4a73",
  violet: "#5b3f73",
  terracotta: "#b8502f",
  ochre: "#c9a227",
  forest: "#3f7a52",
  // Tema oscuro de la interfaz (ver también globals.css). Se usan en el
  // manifest/viewport para que la pantalla de carga de la PWA combine.
  uiBackground: "#0f1729",
  uiPrimary: "#7196c9",
} as const;

import type { WorkType } from "./types";

export const CATEGORY_COLOR: Record<WorkType, string> = {
  pelicula: PALETTE.indigo,
  libro: PALETTE.terracotta,
  album_musica: PALETTE.ochre,
  opera: PALETTE.violet,
  arte: PALETTE.forest,
};
