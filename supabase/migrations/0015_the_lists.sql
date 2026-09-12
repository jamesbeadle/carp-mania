create view public.lake_summaries with (security_invoker = true) as
select
	water.*,
	owner.display_name as owner_name,
	(select count(*)::integer from public.carp where carp.lake_id = water.id) as carp_count,
	(select coalesce(max(carp.weight_lb), 0) from public.carp where carp.lake_id = water.id) as heaviest_lb,
	(select count(*)::integer from public.swims where swims.lake_id = water.id) as swim_count
from public.lakes as water
join public.profiles as owner on owner.id = water.owner_id;

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
	round((angler.line_selection + angler.rig_selection + angler.bait_selection + angler.watercraft) / 4, 1) as overall_skill,
	(select coalesce(max(caught.weight_lb), 0) from public.catches as caught where caught.angler_id = angler.id) as personal_best_lb,
	(select count(*)::integer from public.catches as caught where caught.angler_id = angler.id) as catches
from public.profiles as angler;

grant select on public.lake_summaries, public.angler_summaries to authenticated;

create function public.famous_fish_caught_by(angler uuid, fame_from integer)
returns table (id uuid, name text, strain text, weight_lb numeric, fame integer, lake_id uuid, lake_name text)
language sql stable security invoker as $$
	select fish.id, fish.name, fish.strain, fish.weight_lb, fish.fame, fish.lake_id, water.name
	from public.carp as fish
	left join public.lakes as water on water.id = fish.lake_id
	where fish.fame >= fame_from
		and exists (select 1 from public.catches as caught where caught.carp_id = fish.id and caught.angler_id = angler)
	order by fish.fame desc, fish.weight_lb desc;
$$;

grant execute on function public.famous_fish_caught_by(uuid, integer) to authenticated;

create function public.fish_known_by(fisherman uuid)
returns table (carp_id uuid, best_lb numeric, times_caught integer)
language sql stable security invoker as $$
	select caught.carp_id, max(caught.weight_lb), count(*)::integer
	from public.catches as caught
	where caught.fisherman_id = fisherman and caught.carp_id is not null
	group by caught.carp_id
	order by max(caught.weight_lb) desc;
$$;

grant execute on function public.fish_known_by(uuid) to authenticated;
