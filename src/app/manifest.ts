import type { MetadataRoute } from "next";
import { PALETTE } from "@/lib/palette";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ditirambo",
    short_name: "Ditirambo",
    description:
      "Reseñas y recomendaciones privadas de cine, libros, música, ópera y arte.",
    start_url: "/",
    display: "standalone",
    background_color: PALETTE.uiBackground,
    theme_color: PALETTE.uiPrimary,
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png" },
      { src: "/icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
