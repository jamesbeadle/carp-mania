create or replace function public.record_shoal_catch(
	angler uuid, visit uuid, shoal uuid, fish_name text, fish_strain text, fish_weight numeric,
	swim_name text, rig text, bait text, hook_size integer,
	line_gain numeric, rig_gain numeric, bait_gain numeric, watercraft_gain numeric,
	rod_item text, reel_item text, bait_item text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	the_shoal public.carp_shoals;
	new_fish uuid;
begin
	select * into the_shoal from public.carp_shoals where id = shoal for update;
	if the_shoal.id is null or the_shoal.count = 0 then raise exception 'That shoal is not in this lake'; end if;
	if the_shoal.transit_until is not null or the_shoal.quarantine_until is not null then raise exception 'That shoal cannot be fished for yet'; end if;
	insert into public.carp (lake_id, name, strain, weight_lb, age_years, condition, times_caught, origin, origin_lake_id, fame, is_catalogued, transit_until, quarantine_until)
	values (the_shoal.lake_id, fish_name, fish_strain, fish_weight, the_shoal.age_years, the_shoal.condition, 0, the_shoal.origin,
		case when the_shoal.origin = 'bred' then the_shoal.lake_id else null end, 0, true, null, null)
	returning id into new_fish;
	update public.carp_shoals set count = count - 1 where id = shoal;
	delete from public.carp_shoals where id = shoal and count = 0;
	perform public.record_catch(angler, visit, new_fish, swim_name, rig, bait, hook_size, line_gain, rig_gain, bait_gain, watercraft_gain, rod_item, reel_item, bait_item);
	return new_fish;
end;
$$;

create or replace function public.next_carp_name_index(lake uuid) returns integer
language sql stable as $$
	select count(*)::integer from public.carp where lake_id = lake;
$$;

create or replace function public.sell_shoal_fish(shoal uuid, head_count integer) returns numeric
language plpgsql security definer set search_path = public as $$
declare
	bulk_share constant numeric := 0.45;
	lowest_condition constant numeric := 30;
	the_shoal public.carp_shoals;
	offer numeric;
begin
	select * into the_shoal from public.carp_shoals where id = shoal and public.is_lake_owner(lake_id) for update;
	if the_shoal.id is null then raise exception 'That shoal is not in your water'; end if;
	if head_count <= 0 or head_count > the_shoal.count then raise exception 'The shoal has % fish in it', the_shoal.count; end if;
	if the_shoal.transit_until is not null or the_shoal.quarantine_until is not null then raise exception 'That shoal is on the move'; end if;
	if the_shoal.condition < lowest_condition then raise exception 'The dealer won''t take fish under % condition', lowest_condition; end if;
	offer := round(public.guide_price_of(the_shoal.average_weight_lb, 'common', the_shoal.condition, 0) * bulk_share * head_count);
	insert into public.carp_transfers (carp_id, carp_name, kind, from_lake_id, price, head_count)
	values (null, format('%s fish from a shoal', head_count), 'dealer_purchase', the_shoal.lake_id, offer, head_count);
	update public.carp_shoals set count = count - head_count where id = shoal;
	delete from public.carp_shoals where id = shoal and count = 0;
	perform public.credit_money(auth.uid(), offer);
	return offer;
end;
$$;

revoke execute on function public.record_shoal_catch(uuid, uuid, uuid, text, text, numeric, text, text, text, integer, numeric, numeric, numeric, numeric, text, text, text) from public, anon, authenticated;
grant execute on function public.record_shoal_catch(uuid, uuid, uuid, text, text, numeric, text, text, text, integer, numeric, numeric, numeric, numeric, text, text, text) to service_role;
grant execute on function public.sell_shoal_fish(uuid, integer), public.next_carp_name_index(uuid) to authenticated;
