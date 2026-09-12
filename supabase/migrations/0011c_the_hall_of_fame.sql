create or replace function public.most_fish_landed(scope text, top integer)
returns table (angler_id uuid, angler_name text, catches bigint, heaviest_lb numeric)
language sql stable as $$
	select caught.angler_id, max(caught.angler_name), count(*), max(caught.weight_lb)
	from public.catches as caught
	join public.lakes as water on water.id = caught.lake_id
	where caught.angler_id is not null and (scope = 'world' or water.region = scope)
	group by caught.angler_id
	order by count(*) desc, max(caught.weight_lb) desc
	limit top;
$$;

create or replace function public.waters_of_legend(scope text, top integer)
returns table (lake_id uuid, lake_name text, owner_name text, heaviest_lb numeric, catches bigint)
language sql stable as $$
	select water.id, water.name, owner.display_name, max(caught.weight_lb), count(*)
	from public.catches as caught
	join public.lakes as water on water.id = caught.lake_id
	join public.profiles as owner on owner.id = water.owner_id
	where scope = 'world' or water.region = scope
	group by water.id, water.name, owner.display_name
	order by max(caught.weight_lb) desc, count(*) desc
	limit top;
$$;

grant execute on function public.most_fish_landed(text, integer), public.waters_of_legend(text, integer) to authenticated;
