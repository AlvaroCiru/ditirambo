-- Rediseño Sexo ID-006: lugar = unidad (fecha primera, nota, CCAA, tipo apartamento).

alter type public.sexo_lugar_tipo add value if not exists 'apartamento';

alter table public.sexo_lugares
  add column if not exists fecha_primera date,
  add column if not exists nota text,
  add column if not exists comunidad_autonoma text;

-- Backfill desde encuentros (mínima fecha + título + nota más antigua).
-- No borra filas de sexo_encuentros ni sexo_sugerencias.
with primeros as (
  select distinct on (lugar_id)
    lugar_id,
    titulo,
    fecha,
    notas
  from public.sexo_encuentros
  order by lugar_id, fecha asc, creado_en asc
)
update public.sexo_lugares l
set
  fecha_primera = coalesce(l.fecha_primera, p.fecha),
  nota = case
    when p.titulo is null or trim(p.titulo) = '' then
      coalesce(nullif(trim(l.nota), ''), nullif(trim(p.notas), ''))
    when l.nota is null or trim(l.nota) = '' then
      trim(p.titulo) || case
        when p.notas is null or trim(p.notas) = '' then ''
        else E'\n\n' || trim(p.notas)
      end
    when position(trim(p.titulo) in l.nota) > 0 then
      coalesce(nullif(trim(l.nota), ''), nullif(trim(p.notas), ''))
    else trim(p.titulo) || E'\n\n' || l.nota
  end
from primeros p
where l.id = p.lugar_id;

-- Lugares sin encuentros: usar fecha de creación.
update public.sexo_lugares
set fecha_primera = coalesce(fecha_primera, (creado_en at time zone 'Europe/Madrid')::date)
where fecha_primera is null;

create index if not exists sexo_lugares_fecha_primera_idx
  on public.sexo_lugares (fecha_primera desc);
