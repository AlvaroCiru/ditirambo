import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

function loadEnvLocal() {
  const text = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
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

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT.trim(),
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY.trim(),
  process.env.VAPID_PRIVATE_KEY.trim(),
);

const { data: update } = await admin
  .from("app_updates")
  .select("titulo, version_major, version_minor")
  .order("version_major", { ascending: false })
  .order("version_minor", { ascending: false })
  .limit(1)
  .single();

const version = `v.${update.version_major}.${String(update.version_minor).padStart(2, "0")}`;
const payload = JSON.stringify({
  title: `Actualización ${version}`,
  body: update.titulo,
  url: "/notas/actualizaciones",
});

const { data: rows } = await admin
  .from("push_subscriptions")
  .select("id, user_id, endpoint, p256dh, auth");

for (const row of rows ?? []) {
  try {
    await webpush.sendNotification(
      { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
      payload,
    );
    console.log("OK", row.user_id, row.endpoint.slice(0, 40));
  } catch (err) {
    console.log("FAIL", {
      user: row.user_id,
      status: err?.statusCode,
      body: err?.body?.toString?.() ?? err?.message,
      endpoint: row.endpoint.slice(0, 50),
    });
  }
}
