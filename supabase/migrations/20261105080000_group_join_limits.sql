create or replace function public.rw_join_group(p_code text)
returns uuid language plpgsql security definer set search_path='' as $$
declare target uuid; current_user_id uuid:=auth.uid();
begin
 if current_user_id is null then raise exception 'Anmeldung erforderlich';end if;
 if p_code is null or char_length(p_code) > 30 or char_length(btrim(p_code)) < 4 then raise exception 'Ungültiger Code';end if;
 if not public.rw_limit_attempt('group-join:'||current_user_id::text,30,3600) then raise exception 'Zu viele Anfragen';end if;
 select id into target from public.rw_groups where invite_code=upper(btrim(p_code));
 if target is null then raise exception 'Einladung nicht gefunden';end if;
 insert into public.rw_memberships(group_id,user_id) values(target,current_user_id) on conflict do nothing;
 return target;
end $$;
revoke all on function public.rw_join_group(text) from public,anon;
grant execute on function public.rw_join_group(text) to authenticated;
