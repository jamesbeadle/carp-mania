create function test.square_layout() returns jsonb
language sql immutable as $$
	select '{"version":1,"baseDepthFeet":8,"baseBed":"gravel","outline":[{"x":0.1,"y":0.1},{"x":0.9,"y":0.1},{"x":0.9,"y":0.9},{"x":0.1,"y":0.9}],"islands":[],"depthZones":[],"bedPatches":[],"features":[],"facilities":[]}'::jsonb;
$$;

create function test.give_lake(owner uuid, lake_name text, region_code text, pin_latitude numeric, pin_longitude numeric, water_acres numeric) returns uuid
language plpgsql as $$
declare
	new_lake uuid;
begin
	update public.profiles set home_region = region_code, plot_latitude = pin_latitude, plot_longitude = pin_longitude where id = owner;
	insert into public.lakes (owner_id, name, acres, water_colour, transparency, weed, silt, bank_tidiness, day_ticket_fee, reputation, feed_stock,
		region, latitude, longitude, site_type, plot_acres, layout)
	values (owner, lake_name, water_acres, 40, 60, 20, 20, 60, 20, 20, '{}'::jsonb,
		region_code, pin_latitude, pin_longitude, 'gravel_pit', water_acres * 2, test.square_layout())
	returning id into new_lake;
	return new_lake;
end;
$$;

create function test.give_carp(lake uuid, fish_name text, strain_name text, weight numeric, fish_condition numeric, fish_fame integer) returns uuid
language sql as $$
	insert into public.carp (lake_id, name, strain, weight_lb, age_years, condition, origin, origin_lake_id, fame)
	values (lake, fish_name, strain_name, weight, 5, fish_condition, 'wild', lake, fish_fame)
	returning id;
$$;

create function test.money_of(player uuid) returns numeric
language sql stable as $$
	select money from public.profiles where id = player;
$$;

create function test.lake_of(player uuid) returns uuid
language sql stable as $$
	select id from public.lakes where owner_id = player;
$$;

create function test.farm_fish(fish_name text, weight numeric) returns jsonb
language sql immutable as $$
	select jsonb_build_object('name', fish_name, 'strain', 'common', 'weight_lb', weight, 'age_years', 4, 'condition', 85);
$$;
