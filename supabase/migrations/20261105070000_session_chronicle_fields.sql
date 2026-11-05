alter table public.rw_session_index add column if not exists puzzle text default 'runes';
alter table public.rw_session_index add column if not exists solved jsonb not null default '[]'::jsonb;
alter table public.rw_session_index add column if not exists last_activity timestamptz not null default now();
