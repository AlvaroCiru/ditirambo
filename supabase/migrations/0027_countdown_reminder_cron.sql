-- Marcas de envío para no repetir avisos de cuenta atrás.
alter table public.countdown_trip_reminders
  add column if not exists sent_30d_at timestamptz,
  add column if not exists sent_7d_at timestamptz,
  add column if not exists sent_1d_at timestamptz,
  add column if not exists sent_hoy_at timestamptz;

insert into public.notification_templates (
  key,
  label,
  description,
  title_template,
  body_template,
  enabled,
  url_default,
  variables
)
values (
  'countdown_reminder',
  'Recordatorio de cuenta atrás',
  'Aviso diario cuando faltan 30, 7 o 1 día, o el día del viaje (según preferencias).',
  'Cuenta atrás: {{nombre}}',
  '{{cuando}}{{destino_suffix}}',
  true,
  '/cuenta-atras',
  array['nombre', 'cuando', 'destino_suffix', 'destino']
)
on conflict (key) do update set
  label = excluded.label,
  description = excluded.description,
  title_template = excluded.title_template,
  body_template = excluded.body_template,
  enabled = excluded.enabled,
  url_default = excluded.url_default,
  variables = excluded.variables,
  actualizado_en = now();
