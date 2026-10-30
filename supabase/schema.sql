-- Execute once in Supabase SQL Editor. All access is server-side through Netlify Functions.
create table if not exists public.rw_rooms (
  id uuid primary key default gen_random_uuid(),
  code text unique not null check (code ~ '^[A-Z2-9]{6}$'),
  owner_hash text not null,
  title text not null default 'Neue Kampagne',
  theme text not null default 'ember',
  puzzle text not null default 'runes',
  phase text not null default 'lobby',
  data jsonb not null default '{}'::jsonb,
  version bigint not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);
create table if not exists public.rw_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rw_rooms(id) on delete cascade,
  token_hash text not null unique,
  name text not null,
  role text not null check (role in ('a','b','c')),
  joined_at timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  unique(room_id, role)
);
create index if not exists rw_players_room_idx on public.rw_players(room_id);
alter table public.rw_rooms enable row level security;
alter table public.rw_players enable row level security;
-- Deliberately no anonymous policies; only Netlify serverless functions with service-role access.
-- CAS via row version prevents lost updates when players click simultaneously.
