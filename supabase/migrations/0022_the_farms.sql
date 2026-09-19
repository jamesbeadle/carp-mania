alter table public.carp_transfers drop constraint carp_transfers_farm_band_check;
alter table public.carp_transfers rename column farm_band to farm_pack_id;
alter table public.carp_transfers drop constraint carp_transfers_kind_check;
alter table public.carp_transfers add constraint carp_transfers_kind_check check (kind in ('sale', 'dealer_purchase', 'farm_delivery', 'dealer_sale', 'estate_move'));

create or replace function public.buy_farm_pack(player uuid, pack text, fish jsonb, fish_price numeric, transport numeric, arrives timestamptz, quarantined_until timestamptz, kilometres numeric) returns integer
language plpgsql security definer set search_path = public as $$
declare
	the_lake public.lakes;
	line record;
	new_fish uuid;
	incoming_lb numeric := 0;
begin
	the_lake := public.current_lake_of(player);
	if the_lake.id is null then raise exception 'You need a water of your own before the farm will deliver'; end if;
	if jsonb_typeof(fish) is distinct from 'array' or jsonb_array_length(fish) = 0 then raise exception 'There is nothing on the order'; end if;
	for line in select value from jsonb_array_elements(fish) loop incoming_lb := incoming_lb + (line.value ->> 'weight_lb')::numeric; end loop;
	perform public.assert_lake_has_room(the_lake, incoming_lb);
	perform public.debit_money(player, fish_price + transport, 'That order');
	for line in select value, ordinality from jsonb_array_elements(fish) with ordinality loop
		insert into public.carp (lake_id, name, strain, weight_lb, age_years, condition, times_caught, origin, origin_lake_id, fame, is_catalogued, transit_until, quarantine_until)
		values (the_lake.id, line.value ->> 'name', line.value ->> 'strain', (line.value ->> 'weight_lb')::numeric, (line.value ->> 'age_years')::integer, (line.value ->> 'condition')::numeric, 0, 'farm', null, 0, true, arrives, quarantined_until)
		returning id into new_fish;
		insert into public.carp_transfers (carp_id, carp_name, kind, to_lake_id, price, transport_cost, distance_km, farm_pack_id, departed_at, arrives_at, quarantine_until)
		values (new_fish, line.value ->> 'name', 'farm_delivery', the_lake.id, fish_price / jsonb_array_length(fish), case when line.ordinality = 1 then transport else 0 end, kilometres, pack, now(), arrives, quarantined_until);
	end loop;
	return jsonb_array_length(fish);
end;
$$;

create or replace function public.pack_sold_count(pack text) returns integer
language sql stable as $$
	select count(*)::integer from public.carp_transfers where farm_pack_id = pack and kind = 'farm_delivery';
$$;

drop function public.buy_from_fish_farm(jsonb);
drop function public.deliver_farm_fish(uuid, jsonb, numeric);
drop function public.assert_farm_supply_covers(text, jsonb);
drop function public.assert_farm_fish_is_sound(jsonb);
drop function public.farm_supply_left(text, text);
drop function public.farm_band_price(text);
drop function public.farm_bands();

revoke execute on function public.buy_farm_pack(uuid, text, jsonb, numeric, numeric, timestamptz, timestamptz, numeric) from public, anon, authenticated;
grant execute on function public.buy_farm_pack(uuid, text, jsonb, numeric, numeric, timestamptz, timestamptz, numeric) to service_role;
grant execute on function public.pack_sold_count(text) to authenticated;
