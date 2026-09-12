create or replace function public.buy_from_fish_farm(fish jsonb) returns integer
language plpgsql security definer set search_path = public as $$
declare
	delivery_cost constant numeric := 250;
	the_lake public.lakes;
	region_code text;
	line record;
	total_cost numeric := delivery_cost;
	incoming_lb numeric := 0;
begin
	the_lake := public.current_lake_of(auth.uid());
	if the_lake.id is null then raise exception 'You need a water of your own before the farm will deliver'; end if;
	select home_region into region_code from public.profiles where id = auth.uid();
	if region_code is null then raise exception 'Choose where in the world you fish before ordering from the farm'; end if;
	if jsonb_typeof(fish) is distinct from 'array' then raise exception 'The order must be a list of fish'; end if;
	if jsonb_array_length(fish) = 0 then raise exception 'There is nothing on the order'; end if;
	for line in select value, ordinality from jsonb_array_elements(fish) with ordinality loop
		perform public.assert_farm_fish_is_sound(line.value);
		total_cost := total_cost + public.farm_band_price(line.value ->> 'band');
		incoming_lb := incoming_lb + (line.value ->> 'weight_lb')::numeric;
	end loop;
	perform public.assert_farm_supply_covers(region_code, fish);
	perform public.assert_lake_has_room(the_lake, incoming_lb);
	perform public.debit_money(auth.uid(), total_cost, 'That order');
	for line in select value, ordinality from jsonb_array_elements(fish) with ordinality loop
		perform public.deliver_farm_fish(the_lake.id, line.value, case when line.ordinality = 1 then delivery_cost else 0 end);
	end loop;
	return jsonb_array_length(fish);
end;
$$;

create or replace function public.settle_listing(listing uuid, buyer uuid, price numeric, transport numeric) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	commission_share constant numeric := 0.08;
	sale public.listings;
	buyer_lake public.lakes;
	commission numeric := round(price * commission_share);
	fish_name text;
	transfer uuid;
begin
	select * into sale from public.listings where id = listing for update;
	buyer_lake := public.current_lake_of(buyer);
	perform public.credit_money(sale.seller_id, price - commission);
	transfer := public.ship_carp(sale, buyer_lake, price, commission, transport);
	update public.listings set status = 'sold', sold_price = price, buyer_id = buyer, settled_at = now() where id = listing;
	update public.bids set status = 'won' where listing_id = listing and status = 'leading';
	select carp_name into fish_name from public.carp_transfers where id = transfer;
	perform public.send_notification(sale.seller_id, 'sold', fish_name || ' has sold for ' || public.pounds_sterling(price),
		public.pounds_sterling(price - commission) || ' after commission is in your account; the fish is on its way.', '/carp/' || sale.carp_id);
	perform public.send_notification(buyer, 'won', fish_name || ' is yours', fish_name || ' is on its way to your water.', '/carp/' || sale.carp_id);
	insert into public.world_events (kind, lake_id, other_lake_id, payload)
	values ('sale', sale.lake_id, buyer_lake.id, jsonb_build_object('fishName', fish_name, 'price', price));
	return transfer;
end;
$$;

create or replace function public.close_listing(listing uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
	sale public.listings;
	winner public.bids;
	fish_name text;
	why text;
begin
	select * into sale from public.listings where id = listing for update;
	select * into winner from public.bids where listing_id = listing and status = 'leading';
	if sale.kind = 'auction' and winner.id is not null and winner.amount >= coalesce(sale.reserve_price, 0)
		and (public.current_lake_of(winner.bidder_id)).latitude is not null then
		perform public.settle_listing(listing, winner.bidder_id, winner.amount, winner.transport_cost);
		return;
	end if;
	perform public.refund_leading_bid(listing, 'refunded');
	update public.listings set status = 'unsold', settled_at = now() where id = listing;
	select name into fish_name from public.carp where id = sale.carp_id;
	why := case when winner.id is null then 'Nobody bought it' else 'The bidding did not reach your reserve' end;
	perform public.send_notification(sale.seller_id, 'unsold', fish_name || ' did not sell',
		why || '; the fish stays in your water and the listing fee is spent.', '/carp/' || sale.carp_id);
end;
$$;
