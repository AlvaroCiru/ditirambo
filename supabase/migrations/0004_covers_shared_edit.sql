-- Cualquiera de los 2 usuarios autenticados puede reemplazar/borrar portadas
-- de obras (mismo modelo de confianza que works_update/delete_authenticated).

drop policy if exists "covers_update_own" on storage.objects;
drop policy if exists "covers_delete_own" on storage.objects;

create policy "covers_update_authenticated"
on storage.objects
for update
to authenticated
using (bucket_id = 'covers')
with check (bucket_id = 'covers');

create policy "covers_delete_authenticated"
on storage.objects
for delete
to authenticated
using (bucket_id = 'covers');
