-- Hot paths: activity feed order, pending recommendations, "my reviews".
create index if not exists reviews_creado_en_idx on public.reviews (creado_en desc);
create index if not exists reviews_recomendado_para_idx on public.reviews (recomendado_para);
create index if not exists reviews_user_id_idx on public.reviews (user_id);
