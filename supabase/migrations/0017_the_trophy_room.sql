create function public.catch_cards(angler uuid, top integer)
returns table (
	catch_id uuid, carp_id uuid, weight_lb numeric, caught_at timestamptz, lake_id uuid, lake_name text, region text, swim_name text,
	was_personal_best boolean, was_lake_record boolean, was_region_record boolean, was_world_record boolean,
	holds_lake_record boolean, holds_region_record boolean, holds_world_record boolean
)
language sql stable security invoker as $$
	with anglers_catches as (
		select caught.id, caught.carp_id, caught.angler_id, caught.fisherman_id, caught.weight_lb, caught.caught_at, caught.lake_id, caught.swim_name, water.name as lake_name, water.region
		from public.catches as caught
		join public.lakes as water on water.id = caught.lake_id
		where caught.angler_id is not null
	),
	mine as (select * from anglers_catches where angler_id = angler order by weight_lb desc, caught_at limit top)
	select
		mine.id, mine.carp_id, mine.weight_lb, mine.caught_at, mine.lake_id, mine.lake_name, mine.region, mine.swim_name,
		mine.weight_lb > coalesce((select max(weight_lb) from anglers_catches as earlier where earlier.angler_id = mine.angler_id and earlier.fisherman_id is not distinct from mine.fisherman_id and earlier.caught_at < mine.caught_at), 0),
		mine.weight_lb > coalesce((select max(weight_lb) from anglers_catches as earlier where earlier.lake_id = mine.lake_id and earlier.caught_at < mine.caught_at), 0),
		mine.weight_lb > coalesce((select max(weight_lb) from anglers_catches as earlier where earlier.region = mine.region and earlier.caught_at < mine.caught_at), 0),
		mine.weight_lb > coalesce((select max(weight_lb) from anglers_catches as earlier where earlier.caught_at < mine.caught_at), 0),
		mine.id = (select id from anglers_catches as best where best.lake_id = mine.lake_id order by weight_lb desc, caught_at limit 1),
		mine.id = (select id from anglers_catches as best where best.region = mine.region order by weight_lb desc, caught_at limit 1),
		mine.id = (select id from anglers_catches as best order by weight_lb desc, caught_at limit 1)
	from mine
	order by mine.weight_lb desc, mine.caught_at;
$$;

create function public.records_held_by(angler uuid)
returns table (scope text, scope_id text, scope_name text, catch_id uuid, carp_id uuid, weight_lb numeric, caught_at timestamptz)
language sql stable security invoker as $$
	with anglers_catches as (
		select caught.id, caught.carp_id, caught.angler_id, caught.weight_lb, caught.caught_at, caught.lake_id, water.name as lake_name, water.region
		from public.catches as caught
		join public.lakes as water on water.id = caught.lake_id
		where caught.angler_id is not null
	),
	lake_records as (
		select distinct on (lake_id) 'lake'::text as scope, lake_id::text as scope_id, lake_name as scope_name, id, carp_id, angler_id, weight_lb, caught_at
		from anglers_catches order by lake_id, weight_lb desc, caught_at
	),
	region_records as (
		select distinct on (region) 'region'::text as scope, region as scope_id, region as scope_name, id, carp_id, angler_id, weight_lb, caught_at
		from anglers_catches order by region, weight_lb desc, caught_at
	),
	world_record as (
		select 'world'::text as scope, 'world' as scope_id, 'the world' as scope_name, id, carp_id, angler_id, weight_lb, caught_at
		from anglers_catches order by weight_lb desc, caught_at limit 1
	),
	held as (select * from lake_records union all select * from region_records union all select * from world_record)
	select scope, scope_id, scope_name, id, carp_id, weight_lb, caught_at from held
	where angler_id = angler
	order by case scope when 'world' then 0 when 'region' then 1 else 2 end, weight_lb desc;
$$;

grant execute on function public.catch_cards(uuid, integer), public.records_held_by(uuid) to authenticated;
