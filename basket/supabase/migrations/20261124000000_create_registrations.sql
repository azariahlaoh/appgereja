-- Pendaftaran peserta basket
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_key text generated always as (lower(btrim(name))) stored,
  category text not null,
  detail text,
  created_at timestamptz not null default now(),
  constraint registrations_name_len check (char_length(btrim(name)) between 2 and 60),
  constraint registrations_category_valid check (category in ('Youth', 'College', 'Cool', 'Luar komunitas')),
  constraint registrations_detail_len check (detail is null or char_length(detail) <= 100),
  constraint registrations_name_key_unique unique (name_key)
);

create index registrations_created_at_idx on public.registrations (created_at);

alter table public.registrations enable row level security;

-- Anon hanya boleh SELECT dan INSERT. Tidak ada policy/grant UPDATE & DELETE.
revoke all on public.registrations from anon, authenticated;
grant select on public.registrations to anon;
grant insert (name, category, detail) on public.registrations to anon;

create policy "anon can read registrations"
  on public.registrations for select to anon using (true);

create policy "anon can insert registrations"
  on public.registrations for insert to anon with check (true);
