drop policy if exists "puzzle public or own read" on public.rw_custom_puzzles;
drop policy if exists "published puzzles anon read" on public.rw_custom_puzzles;
create policy "own puzzle read" on public.rw_custom_puzzles for select to authenticated using(owner_id=(select auth.uid()));
revoke select on public.rw_custom_puzzles from anon;

