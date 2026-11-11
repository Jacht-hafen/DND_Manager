create table if not exists public.rw_session_index(
 room_id uuid primary key references public.rw_rooms(id) on delete cascade,
 campaign_id uuid references public.rw_campaigns(id) on delete set null,
 owner_id uuid not null references auth.users(id) on delete cascade,
 code text not null,
 title text not null,
 phase text not null default 'lobby',
 created_at timestamptz not null default now(),
 expires_at timestamptz not null
);
create index if not exists rw_session_index_owner_idx on public.rw_session_index(owner_id,created_at desc);
alter table public.rw_session_index enable row level security;
create policy "session owner read" on public.rw_session_index for select to authenticated using(owner_id=(select auth.uid()));
-- server-controlled session summaries; no INSERT/UPDATE/DELETE granted to browser clients
create table if not exists public.rw_security_events(
 id bigint generated always as identity primary key,
 event_type text not null check(char_length(event_type) between 1 and 60),
 ip_hash text not null check(char_length(ip_hash)<=128),
 room_code text,
 created_at timestamptz not null default now()
);
create index if not exists rw_security_events_date_idx on public.rw_security_events(created_at);
alter table public.rw_security_events enable row level security;
revoke all on public.rw_security_events from anon,authenticated;
create table if not exists public.rw_rate_limits(
 scope text primary key,
 window_start timestamptz not null,
 attempts int not null default 0
);
alter table public.rw_rate_limits enable row level security;
revoke all on public.rw_rate_limits from anon,authenticated;
create or replace function public.rw_limit_attempt(p_scope text,p_max int,p_window_seconds int)
returns boolean language plpgsql security definer set search_path='' as $$
declare n int;
begin
 if length(p_scope)>200 or p_max<1 or p_window_seconds<1 then return false; end if;
 insert into public.rw_rate_limits(scope,window_start,attempts) values(p_scope,now(),1)
 on conflict(scope) do update set
 window_start=case when public.rw_rate_limits.window_start < now()-make_interval(secs=>p_window_seconds) then now() else public.rw_rate_limits.window_start end,
 attempts=case when public.rw_rate_limits.window_start < now()-make_interval(secs=>p_window_seconds) then 1 else public.rw_rate_limits.attempts+1 end
 returning attempts into n;
 return n<=p_max;
end $$;
revoke all on function public.rw_limit_attempt(text,int,int) from public,anon,authenticated;
grant execute on function public.rw_limit_attempt(text,int,int) to service_role;
