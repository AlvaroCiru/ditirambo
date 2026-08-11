-- Seguimiento de notas de desarrollo: estado (kanban) y prioridad.
create type public.dev_note_status as enum (
  'idea',
  'por_hacer',
  'en_curso',
  'hecho'
);

create type public.dev_note_priority as enum (
  'baja',
  'media',
  'alta'
);

alter table public.dev_notes
  add column estado public.dev_note_status not null default 'por_hacer',
  add column prioridad public.dev_note_priority not null default 'media';

create index dev_notes_estado_idx on public.dev_notes (estado);
create index dev_notes_prioridad_idx on public.dev_notes (prioridad);
