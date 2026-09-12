create or replace function public.running_match_at(lake uuid) returns uuid
language sql stable as $$
	select id from public.matches where lake_id = lake and status = 'open' and starts_at <= now() and ends_at > now() limit 1;
$$;

create or replace function public.is_in_match(match uuid, angler uuid) returns boolean
language sql stable as $$
	select exists (select 1 from public.match_entries where match_id = match and angler_id = angler);
$$;

create or replace function public.pay_day_ticket(lake uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	largest_seed constant bigint := 2147483647;
	fee numeric;
	owner uuid;
	angler_name text;
	running uuid;
	visit_id uuid;
begin
	select day_ticket_fee, owner_id into fee, owner from public.lakes
	where id = lake and ((is_public and is_setup_complete) or owner_id = auth.uid());
	if owner is null then raise exception 'That lake is not open to anglers'; end if;
	running := public.running_match_at(lake);
	if running is not null and not public.is_in_match(running, auth.uid()) then
		raise exception 'The water is booked for a match; only the entrants can fish it until it ends';
	end if;
	if owner = auth.uid() or running is not null then fee := 0; end if;
	perform public.debit_money(auth.uid(), fee, 'The day ticket');
	perform public.credit_money(owner, fee);
	select display_name into angler_name from public.profiles where id = auth.uid();
	insert into public.lake_visits (lake_id, angler_id, angler_name, fee_paid, seed)
	values (lake, auth.uid(), angler_name, fee, floor(random() * largest_seed)::bigint) returning id into visit_id;
	return visit_id;
end;
$$;

create or replace function public.enter_match(match uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
	the_match public.matches;
	angler_name text;
	fisherman uuid;
begin
	select * into the_match from public.matches where id = match for update;
	if the_match.id is null then raise exception 'There is no such match'; end if;
	if the_match.status <> 'open' or the_match.ends_at <= now() then raise exception 'That match is over'; end if;
	if public.is_in_match(match, auth.uid()) then raise exception 'You are already in'; end if;
	if (select count(*) from public.match_entries where match_id = match) >= the_match.pegs then raise exception 'Every peg is taken'; end if;
	select display_name, current_fisherman_id into angler_name, fisherman from public.profiles where id = auth.uid();
	if angler_name is null then raise exception 'No angler is signed in'; end if;
	perform public.debit_money(auth.uid(), the_match.entry_fee, 'The entry fee');
	insert into public.match_entries (match_id, angler_id, angler_name, fisherman_id) values (match, auth.uid(), angler_name, fisherman);
end;
$$;
