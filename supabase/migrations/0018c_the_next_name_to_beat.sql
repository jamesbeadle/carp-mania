create function public.board_neighbours(angler uuid)
returns table (side text, angler_id uuid, display_name text, avatar_url text, best_lb numeric, rank integer)
language sql stable security invoker as $$
	with bests as (
		select caught.angler_id, max(caught.weight_lb) as best_lb from public.catches as caught where caught.angler_id is not null group by caught.angler_id
	),
	mine as (select coalesce((select best_lb from bests where bests.angler_id = angler), 0) as best_lb),
	neighbours as (
		(select 'above'::text as side, bests.angler_id, bests.best_lb from bests, mine where bests.best_lb > mine.best_lb order by bests.best_lb asc, bests.angler_id limit 1)
		union all
		(select 'below'::text, bests.angler_id, bests.best_lb from bests, mine where bests.best_lb < mine.best_lb order by bests.best_lb desc, bests.angler_id limit 1)
	)
	select neighbours.side, neighbours.angler_id, who.display_name, who.avatar_url, neighbours.best_lb,
		(select count(*)::integer + 1 from bests as above where above.best_lb > neighbours.best_lb)
	from neighbours
	join public.profiles as who on who.id = neighbours.angler_id;
$$;

grant execute on function public.board_neighbours(uuid) to authenticated;
