create or replace function public.cancel_match(match uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
	the_match public.matches;
	entrant record;
begin
	select * into the_match from public.matches where id = match and host_id = auth.uid() for update;
	if the_match.id is null then raise exception 'That is not your match'; end if;
	if the_match.status <> 'open' then raise exception 'That match is already closed'; end if;
	if the_match.starts_at <= now() then raise exception 'The match has started; it runs to the end now'; end if;
	for entrant in select angler_id from public.match_entries where match_id = match loop
		perform public.credit_money(entrant.angler_id, the_match.entry_fee);
		perform public.send_notification(entrant.angler_id, 'match_cancelled', the_match.title || ' is off',
			'The host has called the match off; your entry fee of ' || public.pounds_sterling(the_match.entry_fee) || ' is back in your pocket.', '/matches/' || match);
	end loop;
	perform public.credit_money(auth.uid(), the_match.host_stake);
	update public.matches set status = 'cancelled', settled_at = now() where id = match;
end;
$$;

create or replace function public.close_match(match uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
	the_match public.matches;
	entry_count integer;
begin
	select * into the_match from public.matches where id = match for update;
	if the_match.id is null or the_match.status <> 'open' then raise exception 'That match is not open'; end if;
	if the_match.ends_at > now() then raise exception 'That match is still running'; end if;
	select count(*) into entry_count from public.match_entries where match_id = match;
	if exists (select 1 from public.match_board(match) where catches > 0) then
		perform public.pay_match_prizes(the_match, the_match.entry_fee * entry_count + the_match.host_stake);
	else
		perform public.call_off_match(the_match, 'Nobody caught a thing');
	end if;
	update public.matches set status = 'settled', settled_at = now() where id = match;
end;
$$;

create or replace function public.close_ended_matches() returns integer
language plpgsql security definer set search_path = public as $$
declare
	ended record;
	closed integer := 0;
begin
	for ended in
		select id from public.matches where status = 'open' and ends_at <= now() order by ends_at for update skip locked
	loop
		perform public.close_match(ended.id);
		closed := closed + 1;
	end loop;
	return closed;
end;
$$;

create or replace function public.match_winners(scope text, top integer)
returns table (angler_id uuid, angler_name text, trophies bigint, prize_money numeric, latest_title text)
language sql stable as $$
	select won.profile_id, (select display_name from public.profiles where id = won.profile_id), count(*), sum(won.prize),
		(select match_title from public.trophies as latest where latest.profile_id = won.profile_id order by won_at desc limit 1)
	from public.trophies as won
	left join public.lakes as water on water.id = won.lake_id
	where scope = 'world' or water.region = scope
	group by won.profile_id
	order by count(*) desc, sum(won.prize) desc
	limit top;
$$;

revoke execute on function public.close_match(uuid), public.close_ended_matches() from public, anon, authenticated;
grant execute on function public.close_ended_matches() to service_role;
grant execute on function public.match_winners(text, integer) to authenticated;

do $schedules$
begin
	if not exists (select 1 from pg_extension where extname = 'pg_cron') then
		raise notice 'pg_cron is not enabled: nothing will close ended matches until it is, or until /cron/close-matches is scheduled on Vercel';
		return;
	end if;
	perform cron.schedule('close-ended-matches', '* * * * *', 'select public.close_ended_matches()');
end
$schedules$;
