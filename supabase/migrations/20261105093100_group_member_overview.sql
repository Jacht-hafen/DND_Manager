create or replace function public.rw_group_member_overview()
returns table(group_id uuid,display_name text,is_owner boolean)
language sql security definer set search_path='' stable as $$
 select m.group_id,
        coalesce(nullif(p.display_name,''),'Mitglied') as display_name,
        (g.owner_id=m.user_id) as is_owner
 from public.rw_memberships m
 join public.rw_groups g on g.id=m.group_id
 left join public.rw_profiles p on p.user_id=m.user_id
 where exists (
  select 1 from public.rw_memberships allowed
  where allowed.group_id=m.group_id and allowed.user_id=auth.uid()
 )
 order by m.joined_at;
$$;
revoke all on function public.rw_group_member_overview() from public,anon;
grant execute on function public.rw_group_member_overview() to authenticated;
