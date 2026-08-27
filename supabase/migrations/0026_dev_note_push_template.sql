insert into public.notification_templates (
  key,
  label,
  description,
  title_template,
  body_template,
  enabled,
  url_default,
  variables
)
values (
  'dev_note_new',
  'Nueva nota de desarrollo',
  'Aviso al otro usuario cuando se publica una nota en el Cuaderno/Tablero.',
  'Nueva nota de desarrollo',
  '{{nombre}} ha publicado «{{titulo}}».',
  true,
  '/notas',
  array['nombre', 'titulo']
)
on conflict (key) do update set
  label = excluded.label,
  description = excluded.description,
  title_template = excluded.title_template,
  body_template = excluded.body_template,
  enabled = excluded.enabled,
  url_default = excluded.url_default,
  variables = excluded.variables,
  actualizado_en = now();
