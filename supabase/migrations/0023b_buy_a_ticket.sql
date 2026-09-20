create or replace function public.buy_ticket(lake uuid, product uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	largest_seed constant bigint := 2147483647;
	session_life constant interval := interval '2 hours';
	the_product public.ticket_products;
	fee numeric;
	owner uuid;
	angler_name text;
	running uuid;
	visit_id uuid;
begin
	select owner_id into owner from public.lakes where id = lake and ((is_public and is_setup_complete) or owner_id = auth.uid());
	if owner is null then raise exception 'That lake is not open to anglers'; end if;
	select * into the_product from public.ticket_products where id = product and lake_id = lake and is_on_sale;
	if the_product.id is null then raise exception 'That ticket is not on sale here'; end if;
	running := public.running_match_at(lake);
	if running is not null and not public.is_in_match(running, auth.uid()) then
		raise exception 'The water is booked for a match; only the entrants can fish it until it ends';
	end if;
	fee := the_product.price * the_product.days;
	if owner = auth.uid() or running is not null then fee := 0; end if;
	perform public.debit_money(auth.uid(), fee, 'The ticket');
	perform public.credit_money(owner, fee);
	select display_name into angler_name from public.profiles where id = auth.uid();
	insert into public.lake_visits (lake_id, angler_id, angler_name, fee_paid, seed, ticket_product_id, session_from_hour, session_to_hour, sessions_left, expires_at)
	values (lake, auth.uid(), angler_name, fee, floor(random() * largest_seed)::bigint, the_product.id,
		public.ticket_window_from(the_product.kind), public.ticket_window_to(the_product.kind), the_product.days, now() + session_life * the_product.days)
	returning id into visit_id;
	return visit_id;
end;
$$;

create or replace function public.pay_day_ticket(lake uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	product uuid;
begin
	product := public.day_product_of(lake);
	if product is null then raise exception 'That water sells no day ticket'; end if;
	return public.buy_ticket(lake, product);
end;
$$;

create or replace function public.sit_the_next_session(visit uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	largest_seed constant bigint := 2147483647;
	the_visit public.lake_visits;
begin
	select * into the_visit from public.lake_visits where id = visit and angler_id = auth.uid() for update;
	if the_visit.id is null then raise exception 'No ticket for this visit'; end if;
	if the_visit.sessions_left <= 1 then raise exception 'That ticket has no sessions left on it'; end if;
	if the_visit.expires_at < now() then raise exception 'That ticket has expired'; end if;
	update public.lake_visits
	set sessions_left = sessions_left - 1, visited_at = now(), seed = floor(random() * largest_seed)::bigint
	where id = visit;
	return visit;
end;
$$;

grant execute on function public.buy_ticket(uuid, uuid), public.sit_the_next_session(uuid), public.day_product_of(uuid) to authenticated;
