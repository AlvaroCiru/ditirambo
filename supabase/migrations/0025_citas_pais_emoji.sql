-- Campos opcionales en citas para Cuenta atrás (viajes): bandera y emoji.

alter table public.citas
  add column if not exists pais_code text,
  add column if not exists emoji text;
