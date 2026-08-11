-- Distingue tareas de seguimiento y notas de actualización publicadas.
create type public.dev_note_tipo as enum ('seguimiento', 'actualizacion');

alter table public.dev_notes
  add column tipo public.dev_note_tipo not null default 'seguimiento';

update public.dev_notes
set tipo = 'actualizacion'
where titulo ilike 'Actualizaci%';

create index dev_notes_tipo_idx on public.dev_notes (tipo);
