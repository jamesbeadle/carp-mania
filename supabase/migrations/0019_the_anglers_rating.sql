create or replace function public.angler_craft(angler uuid) returns numeric
language sql stable as $$
	select round((line_selection + rig_selection + bait_selection + watercraft) / 4, 1) from public.profiles where id = angler;
$$;

create or replace function public.angler_pedigree(angler uuid) returns numeric
language sql stable as $$
	select least(100, coalesce((
		select max(caught.weight_lb) from public.catches as caught
		where caught.fisherman_id = (select current_fisherman_id from public.profiles where id = angler)
	), 0) * 2);
$$;

create or replace function public.angler_rating(angler uuid) returns numeric
language sql stable as $$
	select least(public.angler_craft(angler), public.angler_pedigree(angler));
$$;

drop view public.angler_summaries;
create view public.angler_summaries with (security_invoker = true) as
select
	angler.id,
	angler.display_name,
	angler.avatar_url,
	angler.experience,
	angler.home_region,
	angler.line_selection,
	angler.rig_selection,
	angler.bait_selection,
	angler.watercraft,
	public.angler_rating(angler.id) as rating,
	(select coalesce(max(caught.weight_lb), 0) from public.catches as caught where caught.angler_id = angler.id) as personal_best_lb,
	(select count(*)::integer from public.catches as caught where caught.angler_id = angler.id) as catches
from public.profiles as angler;
grant select on public.angler_summaries to authenticated;

create or replace function public.angler_ranks(angler uuid)
returns table (best_rank integer, best_lb numeric, skill_rank integer, anglers integer)
language sql stable security invoker as $$
	with bests as (
		select caught.angler_id, max(caught.weight_lb) as best_lb from public.catches as caught where caught.angler_id is not null group by caught.angler_id
	),
	mine as (
		select coalesce((select best_lb from bests where angler_id = angler), 0) as best_lb,
			coalesce(public.angler_rating(angler), 0) as rating
	)
	select
		(select count(*)::integer + 1 from bests where best_lb > mine.best_lb),
		mine.best_lb,
		(select count(*)::integer + 1 from public.angler_summaries where rating > mine.rating),
		(select count(*)::integer from public.profiles)
	from mine;
$$;

grant execute on function public.angler_craft(uuid), public.angler_pedigree(uuid), public.angler_rating(uuid) to authenticated;
