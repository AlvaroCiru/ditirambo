-- Registro de actualizaciones separado del seguimiento (ID-XXX).
create table public.app_updates (
  id uuid primary key default gen_random_uuid(),
  version_major integer not null check (version_major >= 1),
  version_minor integer not null check (version_minor >= 0 and version_minor <= 99),
  titulo text not null,
  cuerpo text not null default '',
  creado_por uuid not null references auth.users (id),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  unique (version_major, version_minor)
);

create index app_updates_version_idx
  on public.app_updates (version_major desc, version_minor desc);

alter table public.app_updates enable row level security;

create policy "app_updates_select_authenticated" on public.app_updates
  for select using (auth.uid() is not null);
create policy "app_updates_insert_authenticated" on public.app_updates
  for insert with check (auth.uid() is not null);
create policy "app_updates_update_authenticated" on public.app_updates
  for update using (auth.uid() is not null);
create policy "app_updates_delete_authenticated" on public.app_updates
  for delete using (auth.uid() is not null);

-- Migrar la nota de actualización ID-002 → v.1.01
insert into public.app_updates (version_major, version_minor, titulo, cuerpo, creado_por, creado_en, actualizado_en)
select
  1,
  1,
  titulo,
  trim(cuerpo),
  creado_por,
  creado_en,
  actualizado_en
from public.dev_notes
where tipo = 'actualizacion';

delete from public.dev_notes where tipo = 'actualizacion';

alter table public.dev_notes drop column if exists tipo;
drop type if exists public.dev_note_tipo;
