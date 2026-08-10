-- Notas tipo Letterboxd: 0.5–5.0 en pasos de 0.5 (antes 1–10 entero).
alter table public.reviews drop constraint if exists reviews_nota_check;

alter table public.reviews
  alter column nota type numeric(2,1)
  using (
    case
      when nota is null then null
      else round(nota::numeric / 2.0, 1)
    end
  );

alter table public.reviews
  add constraint reviews_nota_check check (
    nota is null
    or (
      nota >= 0.5
      and nota <= 5
      and (nota * 2) = trunc(nota * 2)
    )
  );
