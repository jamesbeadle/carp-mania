create or replace function public.assert_match_terms(match_title text, starts_in_hours integer, lasts_hours integer, entry numeric, stake numeric, catches_share integer) returns void
language plpgsql as $$
declare
	shortest_title constant integer := 3;
	longest_title constant integer := 60;
	furthest_ahead_hours constant integer := 168;
	largest_entry_fee constant numeric := 100000;
	largest_stake constant numeric := 1000000;
begin
	if length(trim(match_title)) not between shortest_title and longest_title then raise exception 'The match needs a name of % to % letters', shortest_title, longest_title; end if;
	if starts_in_hours < 1 or starts_in_hours > furthest_ahead_hours then raise exception 'A match starts between an hour and a week from now'; end if;
	if lasts_hours not in (3, 6, 12, 24) then raise exception 'A match lasts 3, 6, 12 or 24 hours'; end if;
	if entry < 0 or entry > largest_entry_fee or stake < 0 or stake > largest_stake then raise exception 'The entry fee and the stake must be sensible sums'; end if;
	if entry = 0 and stake = 0 then raise exception 'Put something in the pot: an entry fee or a stake'; end if;
	if catches_share < 0 or catches_share > 100 then raise exception 'The split must be between 0 and 100'; end if;
end;
$$;

create or replace function public.booking_fee_for(water public.lakes, host uuid, lasts_hours integer) returns numeric
language plpgsql stable as $$
declare
	anglers_turned_away_per_hour constant numeric := 6;
	smallest_booking_fee constant numeric := 100;
begin
	if water.owner_id = host then return 0; end if;
	return greatest(smallest_booking_fee, round(water.day_ticket_fee * anglers_turned_away_per_hour * lasts_hours));
end;
$$;

create or replace function public.announce_match(match uuid) returns void
language plpgsql as $$
declare
	the_match public.matches;
	lake_name text;
	owner uuid;
	host_name text;
begin
	select * into the_match from public.matches where id = match;
	select name, owner_id into lake_name, owner from public.lakes where id = the_match.lake_id;
	select display_name into host_name from public.profiles where id = the_match.host_id;
	if owner <> the_match.host_id then
		perform public.send_notification(owner, 'match_booked', lake_name || ' is booked for a match',
			host_name || ' has booked the water for ' || the_match.title || ' and paid ' || public.pounds_sterling(the_match.booking_fee) || '.', '/matches/' || match);
	end if;
	insert into public.world_events (kind, lake_id, payload)
	values ('match_announced', the_match.lake_id, jsonb_build_object('matchId', match, 'matchTitle', the_match.title, 'hostName', host_name, 'startsAt', the_match.starts_at, 'entryFee', the_match.entry_fee));
end;
$$;

create or replace function public.book_match(lake uuid, match_title text, starts_in_hours integer, lasts_hours integer, entry numeric, stake numeric, catches_share integer) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	most_open_matches_per_host constant integer := 3;
	the_lake public.lakes;
	starts timestamptz := now() + make_interval(hours => starts_in_hours);
	ends timestamptz;
	fee numeric;
	peg_count integer;
	created uuid;
begin
	select * into the_lake from public.lakes where id = lake and is_public and is_setup_complete;
	if the_lake.id is null then raise exception 'That water is not open to anglers'; end if;
	perform public.assert_match_terms(match_title, starts_in_hours, lasts_hours, entry, stake, catches_share);
	select count(*) into peg_count from public.swims where lake_id = lake;
	if peg_count = 0 then raise exception 'That water has no pegs to fish from'; end if;
	ends := starts + make_interval(hours => lasts_hours);
	if exists (select 1 from public.matches where lake_id = lake and status = 'open' and starts_at < ends and ends_at > starts) then
		raise exception 'The water is already booked then';
	end if;
	if (select count(*) from public.matches where host_id = auth.uid() and status = 'open') >= most_open_matches_per_host then
		raise exception 'You already have % matches on the go', most_open_matches_per_host;
	end if;
	fee := public.booking_fee_for(the_lake, auth.uid(), lasts_hours);
	perform public.debit_money(auth.uid(), fee, 'The booking fee');
	perform public.debit_money(auth.uid(), stake, 'Your stake');
	perform public.credit_money(the_lake.owner_id, fee);
	insert into public.matches (lake_id, host_id, title, starts_at, ends_at, entry_fee, host_stake, booking_fee, most_catches_share, pegs)
	values (lake, auth.uid(), trim(match_title), starts, ends, entry, stake, fee, catches_share, peg_count) returning id into created;
	perform public.announce_match(created);
	return created;
end;
$$;

revoke execute on function public.assert_match_terms(text, integer, integer, numeric, numeric, integer), public.booking_fee_for(public.lakes, uuid, integer), public.announce_match(uuid)
	from public, anon, authenticated;
