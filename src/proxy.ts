import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export default async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Excluye login (siempre alcanzable), estáticos y geojson.
     * Así /login no depende de Auth ni puede quedar colgado.
     */
    "/((?!login(?:/|$)|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon-|apple-icon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|geojson)$).*)",
  ],
};
