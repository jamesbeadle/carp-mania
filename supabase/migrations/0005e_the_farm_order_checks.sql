create or replace function public.assert_farm_fish_is_sound(line jsonb) returns void
language plpgsql immutable as $$
declare
	lowest_condition constant numeric := 80;
	highest_condition constant numeric := 90;
	band record;
	weight numeric := (line ->> 'weight_lb')::numeric;
	condition numeric := (line ->> 'condition')::numeric;
begin
	select * into band from public.farm_bands() where band_key = line ->> 'band';
	if band.band_key is null then raise exception 'The farm has no "%" band', line ->> 'band'; end if;
	if weight is null or weight < band.minimum_lb or weight > band.maximum_lb then
		raise exception 'A % fish weighs % to % lb', replace(band.band_key, '_', ' '), band.minimum_lb, band.maximum_lb;
	end if;
	if coalesce(line ->> 'strain', '') not in ('common', 'mirror', 'linear', 'fully_scaled', 'leather', 'ghost') then
		raise exception 'The farm does not breed "%"', line ->> 'strain';
	end if;
	if condition is null or condition < lowest_condition or condition > highest_condition then
		raise exception 'Farm fish arrive in condition % to %', lowest_condition, highest_condition;
	end if;
	if coalesce(line ->> 'name', '') = '' or (line ->> 'age_years') is null then
		raise exception 'Every farm fish needs a name and an age';
	end if;
end;
$$;

create or replace function public.assert_farm_supply_covers(region_code text, fish jsonb) returns void
language plpgsql stable security definer set search_path = public as $$
declare
	ordered record;
	left_this_week integer;
begin
	for ordered in select line ->> 'band' as band, count(*) as fish_count from jsonb_array_elements(fish) as line group by 1 loop
		left_this_week := coalesce(public.farm_supply_left(region_code, ordered.band), 0);
		if ordered.fish_count > left_this_week then
			raise exception 'The farm has only % % left this week', left_this_week, replace(ordered.band, '_', ' ');
		end if;
	end loop;
end;
$$;

create or replace function public.assert_lake_has_room(the_lake public.lakes, incoming_lb numeric) returns void
language plpgsql stable security definer set search_path = public as $$
declare
	heaviest_stocking_lb_per_acre constant numeric := 500;
	smallest_water_acres constant numeric := 0.1;
	stocked_lb numeric;
begin
	select coalesce(sum(weight_lb), 0) into stocked_lb from public.carp where lake_id = the_lake.id and is_catalogued;
	if (stocked_lb + incoming_lb) / greatest(smallest_water_acres, the_lake.acres) > heaviest_stocking_lb_per_acre then
		raise exception 'That order would put your water over % lb an acre; the farm won''t deliver to an overstocked lake', heaviest_stocking_lb_per_acre;
	end if;
end;
$$;

revoke execute on function public.assert_farm_supply_covers(text, jsonb), public.assert_lake_has_room(public.lakes, numeric)
	from public, anon, authenticated;
