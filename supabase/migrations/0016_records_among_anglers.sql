create or replace function public.records_broken_by(lake uuid, angler uuid, fish uuid, fish_weight numeric)
returns table (is_lake_record boolean, is_region_record boolean, is_world_record boolean, is_personal_best boolean)
language sql stable security definer set search_path = public as $$
	select
		fish_weight > coalesce((select max(weight_lb) from public.catches where lake_id = lake and angler_id is not null), 0),
		fish_weight > coalesce((
			select max(caught.weight_lb) from public.catches as caught
			join public.lakes as water on water.id = caught.lake_id
			where caught.angler_id is not null and water.region = (select region from public.lakes where id = lake)
		), 0),
		fish_weight > coalesce((select max(weight_lb) from public.catches where angler_id is not null), 0),
		fish_weight > coalesce((select max(weight_lb) from public.catches where fisherman_id = (select current_fisherman_id from public.profiles where id = angler)), 0)
			and not exists (select 1 from public.catches where fisherman_id = (select current_fisherman_id from public.profiles where id = angler) and carp_id = fish);
$$;

create or replace function public.waters_of_legend(scope text, top integer)
returns table (lake_id uuid, lake_name text, owner_name text, heaviest_lb numeric, catches bigint)
language sql stable as $$
	select water.id, water.name, owner.display_name, max(caught.weight_lb), count(*)
	from public.catches as caught
	join public.lakes as water on water.id = caught.lake_id
	join public.profiles as owner on owner.id = water.owner_id
	where caught.angler_id is not null and (scope = 'world' or water.region = scope)
	group by water.id, water.name, owner.display_name
	order by max(caught.weight_lb) desc, count(*) desc
	limit top;
$$;

create function public.visitors_best(scope text)
returns table (weight_lb numeric, carp_id uuid, lake_id uuid, lake_name text, angler_name text, caught_at timestamptz)
language sql stable security invoker as $$
	select caught.weight_lb, caught.carp_id, water.id, water.name, caught.angler_name, caught.caught_at
	from public.catches as caught
	join public.lakes as water on water.id = caught.lake_id
	where caught.angler_id is null and (scope = 'world' or water.region = scope)
	order by caught.weight_lb desc, caught.caught_at desc
	limit 1;
$$;

grant execute on function public.visitors_best(text) to authenticated;

create function public.angler_standing(scope text)
returns table (rank integer, best_lb numeric, anglers integer)
language sql stable security invoker as $$
	with bests as (
		select caught.angler_id, max(caught.weight_lb) as best_lb
		from public.catches as caught
		join public.lakes as water on water.id = caught.lake_id
		where caught.angler_id is not null and (scope = 'world' or water.region = scope)
		group by caught.angler_id
	)
	select
		(select count(*)::integer + 1 from bests where best_lb > (select coalesce(max(best_lb), 0) from bests where angler_id = auth.uid())),
		(select coalesce(max(best_lb), 0) from bests where angler_id = auth.uid()),
		(select count(*)::integer from bests);
$$;

grant execute on function public.angler_standing(text) to authenticated;
