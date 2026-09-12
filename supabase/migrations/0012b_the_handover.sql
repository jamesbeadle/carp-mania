create or replace function public.retire_fisherman(player uuid, heir_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	heir_starting_skill constant numeric := 40;
	shortest_name constant integer := 2;
	old public.fishermen;
	heir uuid;
	skill_now numeric;
	experience_now integer;
begin
	select * into old from public.fishermen where id = (select current_fisherman_id from public.profiles where id = player) for update;
	if old.id is null then raise exception 'There is no fisherman to retire'; end if;
	if public.diary_age_of(old, now()) < old.retires_at_age then raise exception 'The old man has years in him yet'; end if;
	if length(trim(heir_name)) < shortest_name then raise exception 'The heir needs a name'; end if;
	select (line_selection + rig_selection + bait_selection + watercraft) / 4, experience into skill_now, experience_now from public.profiles where id = player;
	update public.fishermen set
		retired_at = now(),
		final_skill = skill_now,
		final_experience = experience_now,
		catches = (select count(*) from public.catches where fisherman_id = old.id),
		personal_best_lb = (select max(weight_lb) from public.catches where fisherman_id = old.id)
	where id = old.id;
	heir := public.begin_fisherman(player, trim(heir_name), old.generation + 1);
	update public.profiles set
		display_name = trim(heir_name),
		line_selection = heir_starting_skill, rig_selection = heir_starting_skill, bait_selection = heir_starting_skill, watercraft = heir_starting_skill,
		experience = 0
	where id = player;
	insert into public.world_events (kind, lake_id, payload)
	select 'handover', id, jsonb_build_object('lakeName', name, 'heirName', trim(heir_name), 'oldName', old.name, 'generation', old.generation + 1)
	from public.lakes where owner_id = player;
	return heir;
end;
$$;

create or replace function public.records_broken_by(lake uuid, angler uuid, fish uuid, fish_weight numeric)
returns table (is_lake_record boolean, is_region_record boolean, is_world_record boolean, is_personal_best boolean)
language sql stable security definer set search_path = public as $$
	select
		fish_weight > coalesce((select max(weight_lb) from public.catches where lake_id = lake), 0),
		fish_weight > coalesce((
			select max(caught.weight_lb) from public.catches as caught
			join public.lakes as water on water.id = caught.lake_id
			where water.region = (select region from public.lakes where id = lake)
		), 0),
		fish_weight > coalesce((select max(weight_lb) from public.catches), 0),
		fish_weight > coalesce((select max(weight_lb) from public.catches where fisherman_id = (select current_fisherman_id from public.profiles where id = angler)), 0)
			and not exists (select 1 from public.catches where fisherman_id = (select current_fisherman_id from public.profiles where id = angler) and carp_id = fish);
$$;

create or replace function public.improve_skills(angler uuid, line_gain numeric, rig_gain numeric, bait_gain numeric, watercraft_gain numeric) returns void
language plpgsql security definer set search_path = public as $$
declare
	largest_gain constant numeric := 2;
	taught_by_the_old_man constant numeric := 1.5;
	pace numeric := 1;
begin
	select case when generation > 1 then taught_by_the_old_man else 1 end into pace
	from public.fishermen where id = (select current_fisherman_id from public.profiles where id = angler);
	pace := coalesce(pace, 1);
	update public.profiles set
		line_selection = least(100, line_selection + least(largest_gain, greatest(0, line_gain)) * pace),
		rig_selection = least(100, rig_selection + least(largest_gain, greatest(0, rig_gain)) * pace),
		bait_selection = least(100, bait_selection + least(largest_gain, greatest(0, bait_gain)) * pace),
		watercraft = least(100, watercraft + least(largest_gain, greatest(0, watercraft_gain)) * pace),
		experience = experience + 1
	where id = angler;
end;
$$;

revoke execute on function public.retire_fisherman(uuid, text) from public, anon, authenticated;
grant execute on function public.retire_fisherman(uuid, text) to service_role;
