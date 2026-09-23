-- A fish can be caught twice in a day. The bailiff no longer refuses the second catch.

create or replace function public.record_catch(
	angler uuid, visit uuid, fish uuid, swim_name text, rig text, bait text, hook_size integer,
	line_gain numeric, rig_gain numeric, bait_gain numeric, watercraft_gain numeric,
	rod_item text, reel_item text, bait_item text, hour_of_day integer default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	day_ticket_life constant interval := interval '2 hours';
	bait_per_catch constant numeric := 1;
	lake uuid;
	visit_started timestamptz;
	the_carp public.carp;
	angler_name text;
	owner_name text;
	fisherman uuid;
	broken record;
	catch_id uuid;
begin
	select lake_id, visited_at into lake, visit_started from public.lake_visits where id = visit and angler_id = angler for update;
	if lake is null then raise exception 'No day ticket for this visit'; end if;
	if visit_started < now() - day_ticket_life then raise exception 'That day ticket has expired'; end if;
	select * into the_carp from public.carp where id = fish and lake_id = lake for update;
	if the_carp.id is null then raise exception 'That carp is not in this lake'; end if;
	if the_carp.transit_until is not null or the_carp.quarantine_until is not null then
		raise exception 'That carp cannot be fished for yet';
	end if;
	select display_name into angler_name from public.profiles where id = angler;
	if angler_name is null then raise exception 'No angler is signed in'; end if;
	select owner.display_name into owner_name from public.lakes as water join public.profiles as owner on owner.id = water.owner_id where water.id = lake;
	select current_fisherman_id into fisherman from public.profiles where id = angler;
	select * into broken from public.records_broken_by(lake, angler, fish, the_carp.weight_lb);

	insert into public.catches (lake_id, carp_id, angler_id, angler_name, owner_name, fisherman_id, weight_lb, swim_name, rig, bait, hook_size, rod_item_id, reel_item_id, hour_of_day, visit_id)
	values (lake, fish, angler, angler_name, owner_name, fisherman, the_carp.weight_lb, swim_name, rig, bait, hook_size, rod_item, reel_item, hour_of_day, visit) returning id into catch_id;
	perform public.use_tackle(angler, bait_item, bait_per_catch);
	update public.carp set
		times_caught = times_caught + 1,
		is_catalogued = true,
		fame = fame + public.fame_for_player_catch(broken.is_lake_record, broken.is_region_record, broken.is_world_record, broken.is_personal_best)
	where id = fish;
	update public.lake_visits set fish_caught = fish_caught + 1 where id = visit;
	perform public.grow_reputation_for_catch(lake, the_carp.weight_lb);
	perform public.improve_skills(angler, line_gain, rig_gain, bait_gain, watercraft_gain);
	perform public.raise_catch_news(lake, fish, the_carp.name, the_carp.weight_lb, angler, angler_name,
		public.record_scope_of(broken.is_lake_record, broken.is_region_record, broken.is_world_record));
	perform public.tell_the_beaten(catch_id);
	return catch_id;
end;
$$;

drop function if exists public.assert_not_yet_caught_this_visit(uuid, uuid, uuid, timestamptz);
