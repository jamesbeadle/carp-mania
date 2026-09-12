create or replace function public.deliver_farm_fish(destination uuid, line jsonb, delivery_cost numeric) returns void
language plpgsql security definer set search_path = public as $$
declare
	delivery_time constant interval := interval '1 hour';
	new_fish uuid;
begin
	insert into public.carp (lake_id, name, strain, weight_lb, age_years, condition, times_caught, origin, origin_lake_id, fame, is_catalogued, transit_until, quarantine_until)
	values (destination, line ->> 'name', line ->> 'strain', (line ->> 'weight_lb')::numeric, (line ->> 'age_years')::integer, (line ->> 'condition')::numeric, 0, 'farm', null, 0, true, now() + delivery_time, null)
	returning id into new_fish;
	insert into public.carp_transfers (carp_id, carp_name, kind, to_lake_id, price, transport_cost, distance_km, farm_band, departed_at, arrives_at)
	values (new_fish, line ->> 'name', 'farm_delivery', destination, public.farm_band_price(line ->> 'band'), delivery_cost, 0, line ->> 'band', now(), now() + delivery_time);
end;
$$;

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
	select * into the_lake from public.lakes where owner_id = auth.uid();
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

revoke execute on function public.deliver_farm_fish(uuid, jsonb, numeric) from public, anon, authenticated;
