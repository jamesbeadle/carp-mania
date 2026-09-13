create function public.milestones_of(angler uuid)
returns table (kind text, reached_at timestamptz)
language sql stable security invoker as $$
	with mine as (select caught.weight_lb, caught.caught_at, caught.lake_id from public.catches as caught where caught.angler_id = angler),
	weights as (select * from (values ('twenty', 20), ('thirty', 30), ('forty', 40), ('fifty', 50)) as threshold (kind, pounds)),
	counts as (select * from (values ('hundred_fish', 100), ('five_hundred_fish', 500)) as tally (kind, fish))
	select weights.kind, (select min(caught_at) from mine where weight_lb >= weights.pounds) from weights
	union all
	select counts.kind, (select caught_at from mine order by caught_at offset counts.fish - 1 limit 1) from counts
	union all
	select 'first_record', (
		select min(mine.caught_at) from mine
		where mine.weight_lb > coalesce((
			select max(earlier.weight_lb) from public.catches as earlier
			where earlier.lake_id = mine.lake_id and earlier.angler_id is not null and earlier.caught_at < mine.caught_at
		), 0)
	)
	union all
	select 'first_trophy', (select min(won_at) from public.trophies where profile_id = angler);
$$;

create function public.angler_ranks(angler uuid)
returns table (best_rank integer, best_lb numeric, skill_rank integer, anglers integer)
language sql stable security invoker as $$
	with bests as (
		select caught.angler_id, max(caught.weight_lb) as best_lb from public.catches as caught where caught.angler_id is not null group by caught.angler_id
	),
	mine as (
		select coalesce((select best_lb from bests where angler_id = angler), 0) as best_lb,
			coalesce((select overall_skill from public.angler_summaries where id = angler), 0) as skill
	)
	select
		(select count(*)::integer + 1 from bests where best_lb > mine.best_lb),
		mine.best_lb,
		(select count(*)::integer + 1 from public.angler_summaries where overall_skill > mine.skill),
		(select count(*)::integer from public.profiles)
	from mine;
$$;

grant execute on function public.milestones_of(uuid), public.angler_ranks(uuid) to authenticated;
