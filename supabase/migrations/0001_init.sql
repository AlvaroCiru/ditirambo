-- Ditirambo: esquema inicial (perfiles, obras, reseñas)
-- Pensado para exactamente 2 usuarios privados, sin registro público.

create type work_type as enum ('pelicula', 'libro', 'album_musica', 'opera', 'arte');
create type work_status as enum ('pendiente', 'en_curso', 'completado');

-- Perfil público mínimo de cada usuario (nombre a mostrar en el feed/reseñas)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

create table public.works (
  id uuid primary key default gen_random_uuid(),
  tipo work_type not null,
  titulo text not null,
  autor_creador text,
  anio integer,
  imagen_url text,
  estado work_status not null default 'pendiente',
  creado_por uuid not null references auth.users (id),
  creado_en timestamptz not null default now(),
  search tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(titulo, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(autor_creador, '')), 'B')
  ) stored
);

create index works_search_idx on public.works using gin (search);
create index works_tipo_idx on public.works (tipo);
create index works_estado_idx on public.works (estado);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.works (id) on delete cascade,
  user_id uuid not null references auth.users (id),
  nota smallint check (nota between 1 and 10),
  texto text,
  recomendado_para uuid references auth.users (id),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (work_id, user_id)
);

create index reviews_work_id_idx on public.reviews (work_id);

-- Crea automáticamente un perfil cuando se da de alta un usuario en Supabase Auth
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Evita que el disparador pueda invocarse directamente vía API (solo debe
-- dispararse como trigger de auth.users, no como función pública).
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Row Level Security: solo usuarios autenticados (los 2 de la pareja) pueden
-- leer; cada uno solo puede escribir/editar/borrar lo suyo.
alter table public.profiles enable row level security;
alter table public.works enable row level security;
alter table public.reviews enable row level security;

create policy "profiles_select_authenticated" on public.profiles
  for select using (auth.uid() is not null);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "works_select_authenticated" on public.works
  for select using (auth.uid() is not null);

create policy "works_insert_authenticated" on public.works
  for insert with check (auth.uid() is not null);

create policy "works_update_authenticated" on public.works
  for update using (auth.uid() is not null);

-- Cualquiera de los 2 puede borrar cualquier obra (evita líos de datos
-- huérfanos en una app de solo 2 usuarios de confianza).
create policy "works_delete_authenticated" on public.works
  for delete using (auth.uid() is not null);

create policy "reviews_select_authenticated" on public.reviews
  for select using (auth.uid() is not null);

create policy "reviews_insert_own" on public.reviews
  for insert with check (auth.uid() = user_id);

create policy "reviews_update_own" on public.reviews
  for update using (auth.uid() = user_id);

-- Cualquiera de los 2 puede borrar cualquier reseña, por el mismo motivo.
create policy "reviews_delete_authenticated" on public.reviews
  for delete using (auth.uid() is not null);

-- Storage: bucket para las portadas/imágenes de las obras.
-- Al ser un bucket público, la lectura funciona por URL directa sin
-- necesidad de política de SELECT (y así evitamos que se puedan listar
-- todos los archivos vía API). Solo hacen falta políticas de escritura.
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

create policy "covers_insert_authenticated"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'covers');

create policy "covers_update_own"
on storage.objects
for update
to authenticated
using (bucket_id = 'covers' and auth.uid()::text = owner_id)
with check (bucket_id = 'covers' and auth.uid()::text = owner_id);

create policy "covers_delete_own"
on storage.objects
for delete
to authenticated
using (bucket_id = 'covers' and auth.uid()::text = owner_id);
