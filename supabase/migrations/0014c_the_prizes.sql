create or replace function public.match_board(match uuid)
returns table (angler_id uuid, angler_name text, fisherman_id uuid, catches bigint, heaviest_lb numeric, heaviest_carp_id uuid)
language sql stable security definer set search_path = public as $$
	select entry.angler_id, entry.angler_name, entry.fisherman_id, count(caught.id), coalesce(max(caught.weight_lb), 0),
		(
			select best.carp_id from public.catches as best
			where best.angler_id = entry.angler_id and best.lake_id = the_match.lake_id and best.caught_at >= the_match.starts_at and best.caught_at < the_match.ends_at
			order by best.weight_lb desc, best.caught_at limit 1
		)
	from public.matches as the_match
	join public.match_entries as entry on entry.match_id = the_match.id
	left join public.catches as caught
		on caught.angler_id = entry.angler_id and caught.lake_id = the_match.lake_id and caught.caught_at >= the_match.starts_at and caught.caught_at < the_match.ends_at
	where the_match.id = match
	group by the_match.lake_id, the_match.starts_at, the_match.ends_at, entry.angler_id, entry.angler_name, entry.fisherman_id, entry.entered_at
	order by count(caught.id) desc, max(caught.weight_lb) desc nulls last, entry.entered_at;
$$;

create or replace function public.award_trophy(the_match public.matches, winner record, kind text, prize numeric) returns void
language plpgsql as $$
declare
	lake_name text;
	feat text;
begin
	select name into lake_name from public.lakes where id = the_match.lake_id;
	feat := case when kind = 'most_catches' then 'most fish, with ' || winner.catches else 'the biggest fish, at ' || public.pounds_and_ounces(winner.heaviest_lb) end;
	insert into public.trophies (match_id, profile_id, fisherman_id, angler_name, kind, match_title, lake_id, lake_name, catches, heaviest_lb, prize)
	values (the_match.id, winner.angler_id, winner.fisherman_id, winner.angler_name, kind, the_match.title, the_match.lake_id, lake_name, winner.catches, winner.heaviest_lb, prize);
	perform public.credit_money(winner.angler_id, prize);
	perform public.send_notification(winner.angler_id, 'match_won', 'You won ' || the_match.title,
		'Yours was ' || feat || '. ' || public.pounds_sterling(prize) || ' is in your pocket and a trophy is in your scrapbook.', '/matches/' || the_match.id);
end;
$$;

create or replace function public.tell_the_field(the_match public.matches) returns void
language plpgsql as $$
declare
	winners text;
	entrant record;
begin
	select string_agg(angler_name || ' (' || replace(kind, '_', ' ') || ')', ', ') into winners from public.trophies where match_id = the_match.id;
	for entrant in
		select entry.angler_id from public.match_entries as entry
		where entry.match_id = the_match.id and not exists (select 1 from public.trophies as won where won.match_id = the_match.id and won.profile_id = entry.angler_id)
	loop
		perform public.send_notification(entrant.angler_id, 'match_over', the_match.title || ' is over', 'The prizes went to ' || winners || '.', '/matches/' || the_match.id);
	end loop;
	insert into public.world_events (kind, lake_id, payload)
	select 'match_won', the_match.lake_id, jsonb_build_object('matchId', the_match.id, 'matchTitle', the_match.title, 'winners', winners,
		'pot', (select sum(prize) from public.trophies where match_id = the_match.id));
end;
$$;

create or replace function public.pay_match_prizes(the_match public.matches, pot numeric) returns void
language plpgsql as $$
declare
	whole constant numeric := 100;
	most_catches bigint;
	heaviest numeric;
	most_catches_winners integer;
	biggest_fish_winners integer;
	most_catches_pot numeric := round(pot * the_match.most_catches_share / whole, 2);
	winner record;
begin
	select max(catches), max(heaviest_lb) into most_catches, heaviest from public.match_board(the_match.id);
	select count(*) filter (where catches = most_catches), count(*) filter (where heaviest_lb = heaviest)
	into most_catches_winners, biggest_fish_winners from public.match_board(the_match.id);
	for winner in select * from public.match_board(the_match.id) where catches = most_catches or heaviest_lb = heaviest loop
		if winner.catches = most_catches then perform public.award_trophy(the_match, winner, 'most_catches', round(most_catches_pot / most_catches_winners, 2)); end if;
		if winner.heaviest_lb = heaviest then perform public.award_trophy(the_match, winner, 'biggest_fish', round((pot - most_catches_pot) / biggest_fish_winners, 2)); end if;
	end loop;
	perform public.tell_the_field(the_match);
end;
$$;

create or replace function public.call_off_match(the_match public.matches, why text) returns void
language plpgsql as $$
declare
	entrant record;
begin
	for entrant in select angler_id from public.match_entries where match_id = the_match.id loop
		perform public.credit_money(entrant.angler_id, the_match.entry_fee);
		perform public.send_notification(entrant.angler_id, 'match_over', the_match.title || ' is over', why || '; your entry fee of ' || public.pounds_sterling(the_match.entry_fee) || ' is back in your pocket.', '/matches/' || the_match.id);
	end loop;
	perform public.credit_money(the_match.host_id, the_match.host_stake);
end;
$$;

revoke execute on function public.award_trophy(public.matches, record, text, numeric), public.tell_the_field(public.matches),
	public.pay_match_prizes(public.matches, numeric), public.call_off_match(public.matches, text)
	from public, anon, authenticated;
