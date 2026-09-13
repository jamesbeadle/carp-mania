drop function public.raise_catch_news(uuid, uuid, text, numeric, text, text);

create function public.raise_catch_news(lake uuid, fish uuid, fish_name text, fish_weight numeric, angler uuid, angler_name text, record_scope text) returns void
language plpgsql security definer set search_path = public as $$
declare
	big_catch_lb constant numeric := 30;
	owner uuid := (select owner_id from public.lakes where id = lake);
	weight text := public.pounds_and_ounces(fish_weight);
begin
	if record_scope is not null then
		insert into public.world_events (kind, lake_id, payload)
		values ('record', lake, jsonb_build_object('fishName', fish_name, 'weightLb', fish_weight, 'scope', record_scope, 'anglerId', angler, 'anglerName', angler_name));
		perform public.send_notification(owner, 'record_set', 'New ' || record_scope || ' record: ' || fish_name || ' at ' || weight,
			angler_name || ' has set a new ' || record_scope || ' record on your water.', '/carp/' || fish);
	end if;
	if fish_weight < big_catch_lb then return; end if;
	insert into public.world_events (kind, lake_id, payload)
	values ('big_catch', lake, jsonb_build_object('fishName', fish_name, 'weightLb', fish_weight, 'anglerId', angler, 'anglerName', angler_name));
	perform public.send_notification(owner, 'big_catch_on_your_water', fish_name || ' out at ' || weight,
		angler_name || ' has just had ' || fish_name || ' from your water.', '/carp/' || fish);
end;
$$;

revoke execute on function public.raise_catch_news(uuid, uuid, text, numeric, uuid, text, text) from public, anon, authenticated;

create or replace function public.record_catch(
	angler uuid, visit uuid, fish uuid, swim_name text, rig text, bait text, hook_size integer,
	line_gain numeric, rig_gain numeric, bait_gain numeric, watercraft_gain numeric
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	day_ticket_life constant interval := interval '2 hours';
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
	perform public.assert_not_yet_caught_this_visit(angler, lake, fish, visit_started);
	select display_name into angler_name from public.profiles where id = angler;
	if angler_name is null then raise exception 'No angler is signed in'; end if;
	select owner.display_name into owner_name from public.lakes as water join public.profiles as owner on owner.id = water.owner_id where water.id = lake;
	select current_fisherman_id into fisherman from public.profiles where id = angler;
	select * into broken from public.records_broken_by(lake, angler, fish, the_carp.weight_lb);

	insert into public.catches (lake_id, carp_id, angler_id, angler_name, owner_name, fisherman_id, weight_lb, swim_name, rig, bait, hook_size)
	values (lake, fish, angler, angler_name, owner_name, fisherman, the_carp.weight_lb, swim_name, rig, bait, hook_size) returning id into catch_id;
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
	return catch_id;
end;
$$;
