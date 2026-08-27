/**
 * Publica una actualización en app_updates y avisa a todos los perfiles
 * con suscripción push (mismo payload que createAppUpdate).
 *
 * Uso: node scripts/publish-app-update.mjs
 * Requiere .env.local con Supabase + VAPID + NEXT_PUBLIC_AVISOS_WEB=1
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  const text = readFileSync(path, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const titulo = "Actualización — Sexo: lugares y mapa";
const cuerpo = `1. Nuevas funcionalidades
- La pestaña Sexo pasa a ser una base de datos de lugares distintos: cada sitio se registra una sola vez, con la fecha de la primera vez, nota o recuerdo y foto opcional.
- Navegación simplificada: Inicio, Mapa, Lugares y Línea temporal. Curiosidades y ajustes de casa siguen accesibles desde Inicio.
- Formulario «Añadir lugar» con localidad, provincia, comunidad, país, mapa y aviso si el lugar parece duplicado. Edición y borrado desde la ficha.
- Mapa de España con provincias registradas en color (sin intensidad por cantidad); al pulsar se amplían y se muestran los lugares. Vista Mundo por países.
- Línea temporal agrupada por año y mes, un lugar por entrada.
- Curiosidades solo geográficas: lugares, ciudades, provincias, comunidades, países, primeras veces y lugar más lejano.
- La nota o recuerdo de cada lugar no tiene límite de caracteres.

2. Errores / correcciones
- Ninguno en esta tanda.

3. Futuras actualizaciones
- Mejoras de búsqueda de sitios por nombre comercial si hace falta.`;

const ALVARO_ID = "1cae6e8b-f6ca-4998-87ea-1d25d81dd7a6";

function formatVersion(major, minor) {
  return `v.${major}.${String(minor).padStart(2, "0")}`;
}

async function sendToUser(admin, userId, payload) {
  const { data: rows, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) throw error;
  if (!rows?.length) {
    console.log(`Sin suscripciones push para ${userId}`);
    return 0;
  }

  const body = JSON.stringify(payload);
  let sent = 0;

  for (const row of rows) {
    try {
      await webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth },
        },
        body,
      );
      sent += 1;
    } catch (err) {
      const status = err?.statusCode;
      console.warn(`Push fallido (${status ?? "sin código"}) para ${row.id}`);
      if (status === 404 || status === 410) {
        await admin.from("push_subscriptions").delete().eq("id", row.id);
      }
    }
  }
  return sent;
}

async function main() {
  const flag = (process.env.NEXT_PUBLIC_AVISOS_WEB ?? "").trim();
  if (!["1", "true", "on", "yes", "si"].includes(flag.toLowerCase())) {
    throw new Error("NEXT_PUBLIC_AVISOS_WEB no está activo en .env.local");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY?.trim();
  const vapidSubject = process.env.VAPID_SUBJECT?.trim();

  if (!url || !secret || !vapidPublic || !vapidPrivate || !vapidSubject) {
    throw new Error("Faltan variables Supabase/VAPID en .env.local");
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
  const admin = createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existing, error: existingError } = await admin
    .from("app_updates")
    .select("version_major, version_minor")
    .order("version_major", { ascending: false })
    .order("version_minor", { ascending: false })
    .limit(1);

  if (existingError) throw existingError;

  let major = 1;
  let minor = 1;
  if (existing?.[0]) {
    major = existing[0].version_major;
    minor = existing[0].version_minor + 1;
    if (minor > 99) {
      major += 1;
      minor = 1;
    }
  }

  const version = formatVersion(major, minor);
  const { data: inserted, error: insertError } = await admin
    .from("app_updates")
    .insert({
      version_major: major,
      version_minor: minor,
      titulo,
      cuerpo,
      creado_por: ALVARO_ID,
    })
    .select("id, version_major, version_minor, titulo")
    .single();

  if (insertError) throw insertError;

  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, display_name");
  if (profilesError) throw profilesError;

  let totalSent = 0;
  for (const profile of profiles ?? []) {
    const n = await sendToUser(admin, profile.id, {
      title: `Actualización ${version}`,
      body: inserted.titulo,
      url: "/notas/actualizaciones",
    });
    console.log(`${profile.display_name}: ${n} aviso(s)`);
    totalSent += n;
  }

  console.log(`Publicada ${version} (${inserted.id}). Avisos enviados: ${totalSent}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
