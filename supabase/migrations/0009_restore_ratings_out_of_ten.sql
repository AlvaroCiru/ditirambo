-- Restaura notas a escala /10 (la migración anterior dividió por 2).
alter table public.reviews drop constraint if exists reviews_nota_check;

alter table public.reviews
  alter column nota type numeric(3,1);

update public.reviews
set nota = round(nota * 2, 1)
where nota is not null;

alter table public.reviews
  add constraint reviews_nota_check check (
    nota is null
    or (
      nota >= 0.5
      and nota <= 10
      and (nota * 2) = trunc(nota * 2)
    )
  );
