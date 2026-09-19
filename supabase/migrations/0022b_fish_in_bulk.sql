create or replace function public.assert_dealer_will_buy(the_carp public.carp) returns void
language plpgsql stable security definer set search_path = public as $$
declare
	lowest_condition constant numeric := 30;
begin
	if not the_carp.is_catalogued then raise exception 'The dealer only buys fish that have been catalogued'; end if;
	if the_carp.transit_until is not null then raise exception 'That fish is in transit'; end if;
	if the_carp.quarantine_until is not null then raise exception 'That fish is in quarantine'; end if;
	if the_carp.condition < lowest_condition then
		raise exception 'The dealer won''t take a fish under % condition', lowest_condition;
	end if;
end;
$$;

create or replace function public.sell_fish_to_dealer(fish uuid[]) returns numeric
language plpgsql security definer set search_path = public as $$
declare
	full_share constant numeric := 0.55;
	bulk_share constant numeric := 0.45;
	full_share_fish constant integer := 3;
	fishery_day constant interval := interval '1 hour';
	the_carp public.carp;
	sold_today integer;
	share numeric;
	offer numeric;
	total numeric := 0;
	one uuid;
begin
	foreach one in array fish loop
		select * into the_carp from public.carp where id = one and public.is_lake_owner(lake_id) for update;
		if the_carp.id is null then raise exception 'That fish is not in your water'; end if;
		if exists (select 1 from public.listings where carp_id = one and status = 'open') then
			raise exception '% is up for sale; cancel the listing before the dealer can take it', the_carp.name;
		end if;
		perform public.assert_dealer_will_buy(the_carp);
		select count(*) into sold_today from public.carp_transfers where from_lake_id = the_carp.lake_id and kind = 'dealer_purchase' and departed_at > now() - fishery_day;
		share := case when sold_today < full_share_fish then full_share else bulk_share end;
		offer := round(public.guide_price_of(the_carp.weight_lb, the_carp.strain, the_carp.condition, the_carp.fame) * share);
		insert into public.carp_transfers (carp_id, carp_name, kind, from_lake_id, price) values (the_carp.id, the_carp.name, 'dealer_purchase', the_carp.lake_id, offer);
		delete from public.carp where id = one;
		total := total + offer;
	end loop;
	perform public.credit_money(auth.uid(), total);
	return total;
end;
$$;

create or replace function public.move_to_my_water(fish uuid[], destination uuid, transport numeric, arrives timestamptz, quarantined_until timestamptz, kilometres numeric) returns integer
language plpgsql security definer set search_path = public as $$
declare
	the_carp public.carp;
	one uuid;
	moved integer := 0;
begin
	if not public.is_lake_owner(destination) then raise exception 'That is not one of your waters'; end if;
	perform public.debit_money(auth.uid(), transport, 'The transport');
	foreach one in array fish loop
		select * into the_carp from public.carp where id = one and public.is_lake_owner(lake_id) for update;
		if the_carp.id is null then raise exception 'That fish is not in your water'; end if;
		if the_carp.lake_id = destination then raise exception '% is already there', the_carp.name; end if;
		if the_carp.transit_until is not null or the_carp.quarantine_until is not null then raise exception '% is already on the move', the_carp.name; end if;
		if exists (select 1 from public.listings where carp_id = one and status = 'open') then raise exception '% is up for sale', the_carp.name; end if;
		insert into public.carp_transfers (carp_id, carp_name, kind, from_lake_id, to_lake_id, price, transport_cost, distance_km, departed_at, arrives_at, quarantine_until)
		values (the_carp.id, the_carp.name, 'estate_move', the_carp.lake_id, destination, 0, case when moved = 0 then transport else 0 end, kilometres, now(), arrives, quarantined_until);
		update public.carp set lake_id = destination, transit_until = arrives, quarantine_until = quarantined_until where id = one;
		moved := moved + 1;
	end loop;
	return moved;
end;
$$;

drop function public.sell_to_dealer(uuid);

grant execute on function public.sell_fish_to_dealer(uuid[]), public.move_to_my_water(uuid[], uuid, numeric, timestamptz, timestamptz, numeric) to authenticated;
