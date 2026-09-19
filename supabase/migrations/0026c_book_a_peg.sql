create or replace function public.book_a_peg(lake uuid, swim uuid, product uuid, day integer) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	the_lake public.lakes;
	the_product public.ticket_products;
	fee numeric;
	booking_id uuid;
begin
	select * into the_lake from public.lakes where id = lake and is_public and is_setup_complete;
	if the_lake.id is null then raise exception 'That water is not open'; end if;
	if not the_lake.is_booking_on then raise exception 'This water is walk-on; no need to book'; end if;
	if day < public.fishery_day_now() then raise exception 'That day has gone'; end if;
	if not exists (select 1 from public.swims where id = swim and lake_id = lake) then raise exception 'That peg is not on this water'; end if;
	if exists (select 1 from public.bookings where swim_id = swim and fishery_day = day and status = 'booked') then raise exception 'That peg is booked that day'; end if;
	select * into the_product from public.ticket_products where id = product and lake_id = lake and is_on_sale;
	if the_product.id is null then raise exception 'That ticket is not on sale here'; end if;
	fee := the_product.price * the_product.days;
	if the_lake.owner_id = auth.uid() or public.is_syndicate_member(lake, auth.uid()) then fee := 0; end if;
	perform public.debit_money(auth.uid(), fee, 'The booking');
	perform public.credit_money(the_lake.owner_id, fee);
	insert into public.bookings (lake_id, swim_id, angler_id, ticket_product_id, fishery_day, fee_paid) values (lake, swim, auth.uid(), product, day, fee) returning id into booking_id;
	return booking_id;
end;
$$;

create or replace function public.buy_ticket(lake uuid, product uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	largest_seed constant bigint := 2147483647;
	session_life constant interval := interval '2 hours';
	the_lake public.lakes;
	the_product public.ticket_products;
	booking public.bookings;
	fee numeric;
	angler_name text;
	running uuid;
	visit_id uuid;
begin
	select * into the_lake from public.lakes where id = lake and ((is_public and is_setup_complete) or owner_id = auth.uid());
	if the_lake.id is null then raise exception 'That lake is not open to anglers'; end if;
	select * into the_product from public.ticket_products where id = product and lake_id = lake and is_on_sale;
	if the_product.id is null then raise exception 'That ticket is not on sale here'; end if;
	running := public.running_match_at(lake);
	if running is not null and not public.is_in_match(running, auth.uid()) then
		raise exception 'The water is booked for a match; only the entrants can fish it until it ends';
	end if;
	fee := the_product.price * the_product.days;
	select * into booking from public.bookings where lake_id = lake and angler_id = auth.uid() and fishery_day = public.fishery_day_now() and status = 'booked' limit 1;
	if the_lake.is_booking_on and booking.id is null and the_lake.owner_id <> auth.uid() then
		if (select count(*) from public.swims where lake_id = lake) - (select count(*) from public.bookings where lake_id = lake and fishery_day = public.fishery_day_now() and status = 'booked') <= 0 then
			raise exception 'Every peg is booked today; book a peg for another day';
		end if;
	end if;
	if public.is_syndicate_water(lake) and the_lake.owner_id <> auth.uid() and not public.is_syndicate_member(lake, auth.uid()) then
		raise exception 'This is a syndicate water; it sells no day tickets';
	end if;
	if the_lake.owner_id = auth.uid() or running is not null or booking.id is not null or public.is_syndicate_member(lake, auth.uid()) then fee := 0; end if;
	perform public.debit_money(auth.uid(), fee, 'The ticket');
	perform public.credit_money(the_lake.owner_id, fee);
	if booking.id is not null then update public.bookings set status = 'fished' where id = booking.id; end if;
	select display_name into angler_name from public.profiles where id = auth.uid();
	insert into public.lake_visits (lake_id, angler_id, angler_name, fee_paid, seed, ticket_product_id, session_from_hour, session_to_hour, sessions_left, expires_at)
	values (lake, auth.uid(), angler_name, fee, floor(random() * largest_seed)::bigint, the_product.id,
		public.ticket_window_from(the_product.kind), public.ticket_window_to(the_product.kind), the_product.days, now() + session_life * the_product.days)
	returning id into visit_id;
	return visit_id;
end;
$$;

grant execute on function public.book_a_peg(uuid, uuid, uuid, integer) to authenticated;
