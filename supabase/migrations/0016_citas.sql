-- Planificador de citas: categorías, estados, tabla, storage y plantilla push.

create type public.cita_categoria as enum (
  'excursiones',
  'operas',
  'museos',
  'conciertos',
  'viajes',
  'cine',
  'restaurantes',
  'hotel',
  'otros'
);

create type public.cita_estado as enum (
  'propuesta',
  'programada',
  'finalizada',
  'rechazada'
);

create table public.citas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  categoria public.cita_categoria not null,
  ubicacion text not null default '',
  inicio_en timestamptz not null,
  fin_en timestamptz not null,
  imagen_url text,
  estado public.cita_estado not null default 'propuesta',
  creado_por uuid not null references auth.users (id),
  aprobado_por uuid references auth.users (id),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  constraint citas_fin_despues_inicio check (fin_en >= inicio_en)
);

create index citas_inicio_en_idx on public.citas (inicio_en);
create index citas_estado_idx on public.citas (estado);
create index citas_categoria_idx on public.citas (categoria);

alter table public.citas enable row level security;

create policy "citas_select_authenticated" on public.citas
  for select using (auth.uid() is not null);

create policy "citas_insert_authenticated" on public.citas
  for insert with check (auth.uid() is not null and auth.uid() = creado_por);

create policy "citas_update_authenticated" on public.citas
  for update using (auth.uid() is not null);

create policy "citas_delete_authenticated" on public.citas
  for delete using (auth.uid() is not null);

insert into storage.buckets (id, name, public)
values ('citas', 'citas', true)
on conflict (id) do nothing;

create policy "citas_storage_insert_authenticated"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'citas');

create policy "citas_storage_update_authenticated"
on storage.objects
for update
to authenticated
using (bucket_id = 'citas')
with check (bucket_id = 'citas');

create policy "citas_storage_delete_authenticated"
on storage.objects
for delete
to authenticated
using (bucket_id = 'citas');

insert into public.notification_templates
  (key, label, description, title_template, body_template, url_default, variables)
values
  (
    'cita_propuesta',
    'Cita propuesta',
    'Se envía a la pareja cuando alguien propone una cita nueva.',
    'Nueva cita propuesta',
    '{{nombre}} propone «{{titulo}}».',
    '/citas/lista',
    array['nombre', 'titulo']
  )
on conflict (key) do nothing;
