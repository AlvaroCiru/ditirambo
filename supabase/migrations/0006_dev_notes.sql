-- Notas de desarrollo: ideas y apuntes sobre futuras actualizaciones.
create table public.dev_notes (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  cuerpo text not null default '',
  creado_por uuid not null references auth.users (id),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index dev_notes_creado_en_idx on public.dev_notes (creado_en desc);

alter table public.dev_notes enable row level security;

create policy "dev_notes_select_authenticated" on public.dev_notes
  for select using (auth.uid() is not null);

create policy "dev_notes_insert_authenticated" on public.dev_notes
  for insert with check (auth.uid() is not null);

create policy "dev_notes_update_authenticated" on public.dev_notes
  for update using (auth.uid() is not null);

create policy "dev_notes_delete_authenticated" on public.dev_notes
  for delete using (auth.uid() is not null);
