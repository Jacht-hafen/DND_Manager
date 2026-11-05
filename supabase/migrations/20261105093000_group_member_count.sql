create or replace function public.rw_group_member_counts()
returns table(group_id uuid,member_count bigint)
language sql security definer set search_path='' stable as $$
 select m.group_id,count(*)::bigint
 from public.rw_memberships m
 where exists (
   select 1 from public.rw_memberships allowed
   where allowed.group_id=m.group_id and allowed.user_id=auth.uid()
 )
 group by m.group_id;
$$;
revoke all on function public.rw_group_member_counts() from public,anon;
grant execute on function public.rw_group_member_counts() to authenticated;
