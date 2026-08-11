-- Marca obras para ver/hacer juntos (distinto de recomendación personal).
alter table public.reviews
  add column para_compartir boolean not null default false;

create index reviews_para_compartir_idx
  on public.reviews (para_compartir)
  where para_compartir = true;
