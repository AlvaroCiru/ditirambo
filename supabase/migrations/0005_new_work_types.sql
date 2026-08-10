-- Nuevas categorías de obra (mismos campos; solo amplía el enum).
alter type public.work_type add value if not exists 'anime';
alter type public.work_type add value if not exists 'serie';
alter type public.work_type add value if not exists 'concierto';
alter type public.work_type add value if not exists 'videojuego';
