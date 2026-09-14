-- Worship Practice App — core schema
-- Run this in the Supabase SQL editor (or via `supabase db push`).
-- Designed so later milestones (BPM/key detection, stem separation,
-- YouTube import) only ever ADD columns/values — never breaking this shape.

create extension if not exists "pgcrypto";

create type song_source as enum ('upload', 'youtube');
create type song_status as enum (
  'uploaded',       -- file stored, no analysis yet
  'analyzing',       -- BPM/key detection in progress
  'analyzed',        -- BPM/key done, stems not requested/done yet
  'separating',      -- stem separation job in progress
  'ready',           -- stems available, playable in practice player
  'error'
);

create table if not exists public.songs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,

  title text not null,
  source song_source not null,
  source_url text,                 -- original YouTube URL, if source = 'youtube'
  original_filename text,          -- original upload filename, if source = 'upload'

  -- Original/master audio, always stored so re-processing never re-uploads.
  storage_path text,               -- path in the `songs` storage bucket

  -- Filled in by later milestones. Nullable now, cached permanently once set
  -- so we never re-run paid detection/separation jobs for the same song.
  bpm numeric,
  musical_key text,
  duration_seconds numeric,

  stem_vocals_path text,
  stem_drums_path text,
  stem_bass_path text,
  stem_other_path text,

  status song_status not null default 'uploaded',
  error_message text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists songs_user_id_idx on public.songs (user_id);

alter table public.songs enable row level security;

create policy "Users can view their own songs"
  on public.songs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own songs"
  on public.songs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own songs"
  on public.songs for update
  using (auth.uid() = user_id);

create policy "Users can delete their own songs"
  on public.songs for delete
  using (auth.uid() = user_id);

-- Keep updated_at fresh on every change.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger songs_set_updated_at
  before update on public.songs
  for each row execute function public.set_updated_at();

-- Storage bucket for original uploads + (later) stems.
-- Private bucket: access only via signed URLs / RLS-checked requests.
insert into storage.buckets (id, name, public)
values ('songs', 'songs', false)
on conflict (id) do nothing;

create policy "Users can upload to their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'songs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read their own files"
  on storage.objects for select
  using (
    bucket_id = 'songs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their own files"
  on storage.objects for delete
  using (
    bucket_id = 'songs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
