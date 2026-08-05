import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Cliente con la clave secreta (service role), solo para operaciones de
 * administración que la clave publicable no puede hacer — aquí, cambiar el
 * email interno de un usuario (su "nombre de usuario") sin pasar por el
 * flujo de confirmación por correo, ya que ese correo no existe de verdad.
 * Nunca importar este módulo desde un Client Component.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
