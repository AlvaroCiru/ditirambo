-- Módulo Sexo: lugares, encuentros, sugerencias, settings (casa) y storage.

create type public.sexo_lugar_tipo as enum (
  'hotel',
  'casa',
  'exterior',
  'coche',
  'otros'
);

create type public.sexo_lugar_estado as enum ('visitado', 'pendiente');

create type public.sexo_sugerencia_estado as enum (
  'propuesta',
  'aceptada',
  'rechazada'
);

create table public.sexo_settings (
  id uuid primary key default gen_random_uuid(),
  clave text not null unique default 'default',
  casa_lat double precision not null default 40.502,
  casa_lng double precision not null default -3.647,
  actualizado_en timestamptz not null default now()
);

insert into public.sexo_settings (clave, casa_lat, casa_lng)
values ('default', 40.502, -3.647)
on conflict (clave) do nothing;

create table public.sexo_lugares (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo public.sexo_lugar_tipo not null default 'otros',
  ubicacion_texto text not null default '',
  lat double precision,
  lng double precision,
  pais_code text,
  provincia text,
  ciudad text,
  imagen_url text,
  estado public.sexo_lugar_estado not null default 'pendiente',
  creado_por uuid not null references auth.users (id),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index sexo_lugares_estado_idx on public.sexo_lugares (estado);
create index sexo_lugares_tipo_idx on public.sexo_lugares (tipo);

create table public.sexo_encuentros (
  id uuid primary key default gen_random_uuid(),
  lugar_id uuid not null references public.sexo_lugares (id) on delete cascade,
  fecha date not null,
  titulo text not null,
  notas text,
  imagen_url text,
  creado_por uuid not null references auth.users (id),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index sexo_encuentros_fecha_idx on public.sexo_encuentros (fecha desc);
create index sexo_encuentros_lugar_id_idx on public.sexo_encuentros (lugar_id);

create table public.sexo_sugerencias (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  notas text,
  tipo public.sexo_lugar_tipo not null default 'otros',
  ubicacion_texto text not null default '',
  lat double precision,
  lng double precision,
  imagen_url text,
  estado public.sexo_sugerencia_estado not null default 'propuesta',
  propuesto_por uuid not null references auth.users (id),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index sexo_sugerencias_estado_idx on public.sexo_sugerencias (estado);

alter table public.sexo_settings enable row level security;
alter table public.sexo_lugares enable row level security;
alter table public.sexo_encuentros enable row level security;
alter table public.sexo_sugerencias enable row level security;

create policy "sexo_settings_select" on public.sexo_settings
  for select using (auth.uid() is not null);
create policy "sexo_settings_update" on public.sexo_settings
  for update using (auth.uid() is not null);
create policy "sexo_settings_insert" on public.sexo_settings
  for insert with check (auth.uid() is not null);

create policy "sexo_lugares_select" on public.sexo_lugares
  for select using (auth.uid() is not null);
create policy "sexo_lugares_insert" on public.sexo_lugares
  for insert with check (auth.uid() is not null);
create policy "sexo_lugares_update" on public.sexo_lugares
  for update using (auth.uid() is not null);
create policy "sexo_lugares_delete" on public.sexo_lugares
  for delete using (auth.uid() is not null);

create policy "sexo_encuentros_select" on public.sexo_encuentros
  for select using (auth.uid() is not null);
create policy "sexo_encuentros_insert" on public.sexo_encuentros
  for insert with check (auth.uid() is not null);
create policy "sexo_encuentros_update" on public.sexo_encuentros
  for update using (auth.uid() is not null);
create policy "sexo_encuentros_delete" on public.sexo_encuentros
  for delete using (auth.uid() is not null);

create policy "sexo_sugerencias_select" on public.sexo_sugerencias
  for select using (auth.uid() is not null);
create policy "sexo_sugerencias_insert" on public.sexo_sugerencias
  for insert with check (auth.uid() is not null);
create policy "sexo_sugerencias_update" on public.sexo_sugerencias
  for update using (auth.uid() is not null);
create policy "sexo_sugerencias_delete" on public.sexo_sugerencias
  for delete using (auth.uid() is not null);

insert into storage.buckets (id, name, public)
values ('sexo', 'sexo', true)
on conflict (id) do nothing;

create policy "sexo_storage_insert_authenticated"
on storage.objects for insert to authenticated
with check (bucket_id = 'sexo');

create policy "sexo_storage_update_authenticated"
on storage.objects for update to authenticated
using (bucket_id = 'sexo') with check (bucket_id = 'sexo');

create policy "sexo_storage_delete_authenticated"
on storage.objects for delete to authenticated
using (bucket_id = 'sexo');
