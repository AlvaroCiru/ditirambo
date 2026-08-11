-- Identificador correlativo visible: ID-001, ID-002, ...
create sequence public.dev_notes_codigo_seq;

alter table public.dev_notes
  add column codigo integer not null default nextval('public.dev_notes_codigo_seq');

alter sequence public.dev_notes_codigo_seq owned by public.dev_notes.codigo;

create unique index dev_notes_codigo_uidx on public.dev_notes (codigo);

-- Las nuevas notas nacen en Ideas por defecto a nivel de BD.
alter table public.dev_notes
  alter column estado set default 'idea';
