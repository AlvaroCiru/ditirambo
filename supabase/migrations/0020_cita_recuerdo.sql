-- Foto recuerdo post-cita (memoria aparte de la imagen de la propuesta).
alter table public.citas
  add column if not exists recuerdo_url text;
