-- Pestaña Cuenta atrás: viajes compartidos con countdown visual.

create table public.countdown_trips (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  destino text not null default '',
  pais_code text,
  inicio_fecha date not null,
  inicio_hora time,
  fin_fecha date,
  emoji text,
  nota text,
  imagen_url text,
  creado_por uuid not null references auth.users (id),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index countdown_trips_inicio_fecha_idx
  on public.countdown_trips (inicio_fecha asc);

alter table public.countdown_trips enable row level security;

create policy "countdown_trips_select" on public.countdown_trips
  for select using (auth.uid() is not null);
create policy "countdown_trips_insert" on public.countdown_trips
  for insert with check (auth.uid() is not null);
create policy "countdown_trips_update" on public.countdown_trips
  for update using (auth.uid() is not null);
create policy "countdown_trips_delete" on public.countdown_trips
  for delete using (auth.uid() is not null);

-- Recordatorios opcionales por usuario y viaje (avisos futuros).
create table public.countdown_trip_reminders (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.countdown_trips (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  remind_30d boolean not null default false,
  remind_7d boolean not null default false,
  remind_1d boolean not null default false,
  remind_hoy boolean not null default false,
  actualizado_en timestamptz not null default now(),
  unique (trip_id, user_id)
);

alter table public.countdown_trip_reminders enable row level security;

create policy "countdown_reminders_select" on public.countdown_trip_reminders
  for select using (auth.uid() = user_id);
create policy "countdown_reminders_insert" on public.countdown_trip_reminders
  for insert with check (auth.uid() = user_id);
create policy "countdown_reminders_update" on public.countdown_trip_reminders
  for update using (auth.uid() = user_id);
create policy "countdown_reminders_delete" on public.countdown_trip_reminders
  for delete using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('cuenta-atras', 'cuenta-atras', true)
on conflict (id) do nothing;

create policy "cuenta_atras_storage_insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'cuenta-atras');

create policy "cuenta_atras_storage_update"
on storage.objects for update to authenticated
using (bucket_id = 'cuenta-atras') with check (bucket_id = 'cuenta-atras');

create policy "cuenta_atras_storage_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'cuenta-atras');
