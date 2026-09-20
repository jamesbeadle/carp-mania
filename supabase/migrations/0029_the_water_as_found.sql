alter table public.lake_visits
	add column water_as_found jsonb,
	add column skills_at_start jsonb;

create or replace function public.water_as_found(lake uuid) returns jsonb
language sql stable set search_path = public as $$
	select jsonb_build_object(
		'lake', (select to_jsonb(water) from public.lakes as water where water.id = lake),
		'carp', coalesce((select jsonb_agg(to_jsonb(fish) order by fish.id) from public.carp as fish where fish.lake_id = lake), '[]'::jsonb),
		'shoals', coalesce((select jsonb_agg(to_jsonb(shoal) order by shoal.id) from public.carp_shoals as shoal where shoal.lake_id = lake), '[]'::jsonb),
		'species', coalesce((select jsonb_agg(to_jsonb(kind) order by kind.species) from public.lake_species as kind where kind.lake_id = lake), '[]'::jsonb)
	);
$$;

create or replace function public.skills_of_angler(angler uuid) returns jsonb
language sql stable set search_path = public as $$
	select jsonb_build_object(
		'line_selection', line_selection,
		'rig_selection', rig_selection,
		'bait_selection', bait_selection,
		'watercraft', watercraft
	) from public.profiles where id = angler;
$$;

create or replace function public.freeze_the_water_for_the_visit() returns trigger
language plpgsql set search_path = public as $$
begin
	new.water_as_found := public.water_as_found(new.lake_id);
	new.skills_at_start := public.skills_of_angler(new.angler_id);
	return new;
end;
$$;

create trigger freeze_the_water_for_the_visit
	before insert or update of visited_at on public.lake_visits
	for each row when (new.angler_id is not null) execute function public.freeze_the_water_for_the_visit();

update public.lake_visits
set water_as_found = public.water_as_found(lake_id), skills_at_start = public.skills_of_angler(angler_id)
where angler_id is not null and visited_at > now() - interval '2 hours';
