create or replace function public.record_catch(
	angler uuid, visit uuid, fish uuid, swim_name text, rig text, bait text, hook_size integer,
	line_gain numeric, rig_gain numeric, bait_gain numeric, watercraft_gain numeric
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	lake uuid;
	the_carp public.carp;
	angler_name text;
	broken record;
	catch_id uuid;
begin
	select lake_id into lake from public.lake_visits where id = visit and angler_id = angler;
	if lake is null then raise exception 'No day ticket for this visit'; end if;
	select * into the_carp from public.carp where id = fish and lake_id = lake for update;
	if the_carp.id is null then raise exception 'That carp is not in this lake'; end if;
	if the_carp.transit_until is not null or the_carp.quarantine_until is not null then
		raise exception 'That carp cannot be fished for yet';
	end if;
	select display_name into angler_name from public.profiles where id = angler;
	if angler_name is null then raise exception 'No angler is signed in'; end if;
	select * into broken from public.records_broken_by(lake, angler, fish, the_carp.weight_lb);

	insert into public.catches (lake_id, carp_id, angler_id, angler_name, weight_lb, swim_name, rig, bait, hook_size)
	values (lake, fish, angler, angler_name, the_carp.weight_lb, swim_name, rig, bait, hook_size) returning id into catch_id;
	update public.carp set
		times_caught = times_caught + 1,
		is_catalogued = true,
		fame = fame + public.fame_for_player_catch(broken.is_lake_record, broken.is_region_record, broken.is_world_record, broken.is_personal_best)
	where id = fish;
	update public.lake_visits set fish_caught = fish_caught + 1 where id = visit;
	perform public.grow_reputation_for_catch(lake, the_carp.weight_lb);
	perform public.improve_skills(angler, line_gain, rig_gain, bait_gain, watercraft_gain);
	perform public.raise_catch_news(lake, fish, the_carp.name, the_carp.weight_lb, angler_name,
		public.record_scope_of(broken.is_lake_record, broken.is_region_record, broken.is_world_record));
	return catch_id;
end;
$$;

revoke execute on function public.record_catch(uuid, uuid, uuid, text, text, text, integer, numeric, numeric, numeric, numeric)
	from public, anon, authenticated;
grant execute on function public.record_catch(uuid, uuid, uuid, text, text, text, integer, numeric, numeric, numeric, numeric)
	to service_role;
