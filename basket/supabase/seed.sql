-- 8 peserta awal, urut sesuai waktu daftar.
insert into public.registrations (name, category, detail, created_at) values
  ('Jeremia Frederik',        'College',        'TEH',                    now() - interval '8 minutes'),
  ('Cephas Siregar',          'College',        'SSM',                    now() - interval '7 minutes'),
  ('Danelle',                 'Luar komunitas', null,                     now() - interval '6 minutes'),
  ('Andrew',                  'College',        'me lord',                now() - interval '5 minutes'),
  ('Othniel Josh Tantoputro', 'Youth',          'Huddle 12M',             now() - interval '4 minutes'),
  ('Arvy',                    'Youth',          'Huddle 10M',             now() - interval '3 minutes'),
  ('Fransisco',               'Youth',          'Huddle 10 Male',         now() - interval '2 minutes'),
  ('Rian Laoh',               'Cool',           'ka sharon, Cool PIM 5',  now() - interval '1 minutes')
on conflict (name_key) do nothing;
