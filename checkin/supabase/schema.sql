-- Grow Youth Check-in: skema awal.
-- Semua akses lewat server (service role). RLS aktif TANPA policy,
-- jadi anon key tidak bisa baca/tulis apa pun.

create extension if not exists pgcrypto;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  type text not null default 'member' check (type in ('member','guest')),
  full_name text not null,
  phone text unique,
  birth_date date,
  school text,
  area text,
  is_new boolean not null default false,
  invited_by text,
  consent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  service_date date not null,
  checked_in_at timestamptz not null default now(),
  source text not null default 'scan',
  unique (member_id, service_date)
);
create index if not exists attendance_date_idx on public.attendance (service_date);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null default '',
  pinned boolean not null default false,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.members enable row level security;
alter table public.attendance enable row level security;
alter table public.announcements enable row level security;
-- Sengaja tanpa policy.
