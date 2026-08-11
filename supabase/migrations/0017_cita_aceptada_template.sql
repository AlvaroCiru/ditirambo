insert into public.notification_templates
  (key, label, description, title_template, body_template, url_default, variables)
values
  (
    'cita_aceptada',
    'Cita aceptada',
    'Se envía a quien propuso la cita cuando la pareja la acepta.',
    'Cita aceptada',
    '{{nombre}} ha aceptado «{{titulo}}».',
    '/citas/lista',
    array['nombre', 'titulo']
  )
on conflict (key) do nothing;
