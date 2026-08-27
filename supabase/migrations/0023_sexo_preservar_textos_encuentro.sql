-- Preservar títulos de encuentros en nota del lugar + CCAA cuando falte.
-- Idempotente: no borra sexo_encuentros ni sexo_sugerencias.

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
    when position(trim(p.titulo) in l.nota) > 0 then l.nota
    else trim(p.titulo) || E'\n\n' || l.nota
  end,
  actualizado_en = now()
from primeros p
where l.id = p.lugar_id;

-- Comunidad de Madrid si provincia normalizada es Madrid y CCAA vacía.
update public.sexo_lugares
set
  comunidad_autonoma = 'Comunidad de Madrid',
  actualizado_en = now()
where (comunidad_autonoma is null or trim(comunidad_autonoma) = '')
  and provincia is not null
  and lower(trim(provincia)) in ('madrid', 'community of madrid', 'comunidad de madrid');
