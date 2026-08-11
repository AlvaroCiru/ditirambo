-- Admin flag + plantillas editables de avisos push.
alter table public.profiles
  add column if not exists es_admin boolean not null default false;

update public.profiles
set es_admin = true
where id = '1cae6e8b-f6ca-4998-87ea-1d25d81dd7a6';

create table public.notification_templates (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  label text not null,
  description text not null default '',
  title_template text not null,
  body_template text not null,
  enabled boolean not null default true,
  url_default text not null default '/resenas',
  variables text[] not null default '{}',
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

alter table public.notification_templates enable row level security;

create policy "notification_templates_select_admin" on public.notification_templates
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.es_admin = true
    )
  );

create policy "notification_templates_update_admin" on public.notification_templates
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.es_admin = true
    )
  );

insert into public.notification_templates
  (key, label, description, title_template, body_template, url_default, variables)
values
  (
    'review_new',
    'Nueva reseña',
    'Se envía a la pareja cuando alguien publica o actualiza una reseña sin recomendación ni «Para compartir».',
    'Nueva reseña',
    '{{nombre}} ha reseñado «{{titulo}}».',
    '/resenas',
    array['nombre', 'titulo']
  ),
  (
    'review_recommendation',
    'Nueva recomendación',
    'Se envía a la pareja cuando se marca «Recomendar a mi pareja».',
    'Nueva recomendación',
    '{{nombre}} te ha recomendado «{{titulo}}».',
    '/resenas',
    array['nombre', 'titulo']
  ),
  (
    'review_shared',
    'Para compartir',
    'Se envía a la pareja cuando se marca «Para compartir».',
    'Para compartir',
    '{{nombre}} ha marcado «{{titulo}}» para ver o hacer juntos.',
    '/resenas',
    array['nombre', 'titulo']
  ),
  (
    'app_update',
    'Actualización de producto',
    'Se envía a ambos perfiles al publicar una nota de actualización (v.X.XX).',
    'Actualización {{version}}',
    '{{titulo}}',
    '/notas/actualizaciones',
    array['version', 'titulo']
  ),
  (
    'push_test',
    'Aviso de prueba',
    'Se envía al propio usuario desde Perfil para comprobar que los avisos funcionan.',
    'Ditirambo',
    'Aviso de prueba: si lees esto, los avisos funcionan.',
    '/perfil',
    array[]::text[]
  );
