-- Runenwerk features, 2026-11
create table if not exists public.rw_campaigns (
 id uuid primary key default gen_random_uuid(),
 group_id uuid not null references public.rw_groups(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null check (char_length(name) between 3 and 100),
 description text not null default '' check (char_length(description)<=2000),
 created_at timestamptz not null default now()
);
create index if not exists rw_campaigns_group_idx on public.rw_campaigns(group_id);
alter table public.rw_campaigns enable row level security;
create policy "campaign members read" on public.rw_campaigns for select to authenticated
 using (owner_id=(select auth.uid()) or exists (select 1 from public.rw_memberships m where m.group_id=group_id and m.user_id=(select auth.uid())));
create policy "premium campaign creation" on public.rw_campaigns for insert to authenticated
 with check (owner_id=(select auth.uid()) and exists (select 1 from public.rw_groups g where g.id=group_id and g.owner_id=(select auth.uid())) and exists (select 1 from public.rw_profiles p where p.user_id=(select auth.uid()) and p.is_premium));
create policy "campaign owner update" on public.rw_campaigns for update to authenticated
 using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()) and exists(select 1 from public.rw_groups g where g.id=group_id and g.owner_id=(select auth.uid())));
create policy "campaign owner delete" on public.rw_campaigns for delete to authenticated using(owner_id=(select auth.uid()));

create table if not exists public.rw_custom_puzzles(
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(char_length(title) between 3 and 100),
 category text not null default 'Logik' check(char_length(category)<=40),
 duration_minutes int not null default 15 check(duration_minutes between 1 and 240),
 difficulty text not null default 'Mittel' check(difficulty in ('Leicht','Mittel','Schwer')),
 description text not null default '' check(char_length(description)<=6000),
 solution text not null default '' check(char_length(solution)<=6000),
 hints jsonb not null default '[]'::jsonb check(jsonb_typeof(hints)='array'),
 published boolean not null default false,
 created_at timestamptz not null default now()
);
create index if not exists rw_custom_puzzles_owner_idx on public.rw_custom_puzzles(owner_id);
alter table public.rw_custom_puzzles enable row level security;
create policy "puzzle public or own read" on public.rw_custom_puzzles for select to authenticated
 using(published or owner_id=(select auth.uid()));
create policy "premium puzzle create" on public.rw_custom_puzzles for insert to authenticated
 with check(owner_id=(select auth.uid()) and exists(select 1 from public.rw_profiles p where p.user_id=(select auth.uid()) and p.is_premium));
create policy "own puzzle update" on public.rw_custom_puzzles for update to authenticated
 using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy "own puzzle delete" on public.rw_custom_puzzles for delete to authenticated using(owner_id=(select auth.uid()));
create policy "published puzzles anon read" on public.rw_custom_puzzles for select to anon using(published);
grant select on public.rw_custom_puzzles to anon;

create table if not exists public.rw_favorites(
 user_id uuid not null references auth.users(id) on delete cascade,
 puzzle_id text not null check(char_length(puzzle_id) between 1 and 80),
 created_at timestamptz not null default now(),
 primary key(user_id,puzzle_id)
);
alter table public.rw_favorites enable row level security;
create policy "own favorites select" on public.rw_favorites for select to authenticated using(user_id=(select auth.uid()));
create policy "own favorites insert" on public.rw_favorites for insert to authenticated with check(user_id=(select auth.uid()));
create policy "own favorites delete" on public.rw_favorites for delete to authenticated using(user_id=(select auth.uid()));

create table if not exists public.rw_reviews(
 user_id uuid not null references auth.users(id) on delete cascade,
 puzzle_id text not null check(char_length(puzzle_id) between 1 and 80),
 rating int not null check(rating between 1 and 5),
 difficulty int not null check(difficulty between 1 and 5),
 comment text not null default '' check(char_length(comment)<=500),
 created_at timestamptz not null default now(),
 primary key(user_id,puzzle_id)
);
alter table public.rw_reviews enable row level security;
create policy "reviews read" on public.rw_reviews for select to anon,authenticated using(true);
create policy "own reviews insert" on public.rw_reviews for insert to authenticated with check(user_id=(select auth.uid()));
create policy "own reviews update" on public.rw_reviews for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy "own reviews delete" on public.rw_reviews for delete to authenticated using(user_id=(select auth.uid()));
grant select on public.rw_reviews to anon;

create table if not exists public.rw_handouts(
 id uuid primary key default gen_random_uuid(),
 campaign_id uuid not null references public.rw_campaigns(id) on delete cascade,
 owner_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(char_length(title) between 3 and 120),
 content text not null default '' check(char_length(content)<=10000),
 visible_to_players boolean not null default false,
 created_at timestamptz not null default now()
);
create index if not exists rw_handouts_campaign_idx on public.rw_handouts(campaign_id);
alter table public.rw_handouts enable row level security;
create policy "handout owners and shared group" on public.rw_handouts for select to authenticated
 using(owner_id=(select auth.uid()) or (visible_to_players and exists(
 select 1 from public.rw_campaigns c join public.rw_memberships m on m.group_id=c.group_id
 where c.id=campaign_id and m.user_id=(select auth.uid())
 )));
create policy "handout owner insert" on public.rw_handouts for insert to authenticated
 with check(owner_id=(select auth.uid()) and exists(select 1 from public.rw_campaigns c where c.id=campaign_id and c.owner_id=(select auth.uid())));
create policy "handout owner update" on public.rw_handouts for update to authenticated
 using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()) and exists(select 1 from public.rw_campaigns c where c.id=campaign_id and c.owner_id=(select auth.uid())));
create policy "handout owner delete" on public.rw_handouts for delete to authenticated using(owner_id=(select auth.uid()));

alter table public.rw_rooms add column if not exists campaign_id uuid references public.rw_campaigns(id) on delete set null;
alter table public.rw_rooms add column if not exists owner_user_id uuid references auth.users(id) on delete set null;
create index if not exists rw_rooms_campaign_idx on public.rw_rooms(campaign_id);
create index if not exists rw_rooms_owner_user_idx on public.rw_rooms(owner_user_id);

