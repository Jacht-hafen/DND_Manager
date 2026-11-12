-- Public reviews expose only aggregates; user-specific reviews remain private.
drop policy if exists "reviews read" on public.rw_reviews;
drop policy if exists "own reviews read" on public.rw_reviews;
create policy "own reviews read" on public.rw_reviews
for select to authenticated using (user_id=(select auth.uid()));
revoke select on public.rw_reviews from anon;
grant select on public.rw_reviews to authenticated;

create or replace function public.rw_review_summary()
returns table(
 puzzle_id text,
 rating_count bigint,
 average_rating numeric,
 average_difficulty numeric
)
language sql stable security definer set search_path=''
as $$
 select r.puzzle_id, count(*)::bigint,
        round(avg(r.rating)::numeric,2),
        round(avg(r.difficulty)::numeric,2)
 from public.rw_reviews r
 group by r.puzzle_id
$$;
revoke all on function public.rw_review_summary() from public;
grant execute on function public.rw_review_summary() to anon,authenticated;
