drop function public.record_catch(uuid, uuid, text, text, text, integer, numeric, numeric, numeric, numeric);

create or replace function public.pounds_and_ounces(weight_lb numeric) returns text
language sql immutable as $$
	select case
		when round((weight_lb - floor(weight_lb)) * 16) = 0 then floor(weight_lb) || ' lb'
		when round((weight_lb - floor(weight_lb)) * 16) = 16 then (floor(weight_lb) + 1) || ' lb'
		else floor(weight_lb) || ' lb ' || round((weight_lb - floor(weight_lb)) * 16) || ' oz'
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
		fish_weight > coalesce((select max(weight_lb) from public.catches where angler_id = angler), 0)
			and not exists (select 1 from public.catches where angler_id = angler and carp_id = fish);
$$;

create or replace function public.fame_for_player_catch(is_lake_record boolean, is_region_record boolean, is_world_record boolean, is_personal_best boolean) returns integer
language sql immutable as $$
	select 3
		+ case when is_lake_record then 10 else 0 end
		+ case when is_region_record then 25 else 0 end
		+ case when is_world_record then 50 else 0 end
		+ case when is_personal_best then 2 else 0 end;
$$;

create or replace function public.record_scope_of(is_lake_record boolean, is_region_record boolean, is_world_record boolean) returns text
language sql immutable as $$
	select case when is_world_record then 'world' when is_region_record then 'region' when is_lake_record then 'lake' end;
$$;

create or replace function public.raise_catch_news(lake uuid, fish uuid, fish_name text, fish_weight numeric, angler_name text, record_scope text) returns void
language plpgsql security definer set search_path = public as $$
declare
	big_catch_lb constant numeric := 30;
	owner uuid := (select owner_id from public.lakes where id = lake);
	weight text := public.pounds_and_ounces(fish_weight);
begin
	if record_scope is not null then
		insert into public.world_events (kind, lake_id, payload)
		values ('record', lake, jsonb_build_object('fishName', fish_name, 'weightLb', fish_weight, 'scope', record_scope));
		perform public.send_notification(owner, 'record_set', 'New ' || record_scope || ' record: ' || fish_name || ' at ' || weight,
			angler_name || ' has set a new ' || record_scope || ' record on your water.', '/carp/' || fish);
	end if;
	if fish_weight < big_catch_lb then return; end if;
	insert into public.world_events (kind, lake_id, payload)
	values ('big_catch', lake, jsonb_build_object('fishName', fish_name, 'weightLb', fish_weight, 'anglerName', angler_name));
	perform public.send_notification(owner, 'big_catch_on_your_water', fish_name || ' out at ' || weight,
		angler_name || ' has just had ' || fish_name || ' from your water.', '/carp/' || fish);
end;
$$;

create or replace function public.improve_skills(angler uuid, line_gain numeric, rig_gain numeric, bait_gain numeric, watercraft_gain numeric) returns void
language plpgsql security definer set search_path = public as $$
declare
	largest_gain constant numeric := 2;
begin
	update public.profiles set
		line_selection = least(100, line_selection + least(largest_gain, greatest(0, line_gain))),
		rig_selection = least(100, rig_selection + least(largest_gain, greatest(0, rig_gain))),
		bait_selection = least(100, bait_selection + least(largest_gain, greatest(0, bait_gain))),
		watercraft = least(100, watercraft + least(largest_gain, greatest(0, watercraft_gain))),
		experience = experience + 1
	where id = angler;
end;
$$;

create or replace function public.grow_reputation_for_catch(lake uuid, fish_weight numeric) returns void
language plpgsql security definer set search_path = public as $$
declare
	reputation_gain numeric := 0.05 + greatest(0, fish_weight - 20) * 0.05 + greatest(0, fish_weight - 30) * 0.12;
begin
	update public.lakes set reputation = least(100, reputation + reputation_gain * (1 - reputation / 100)) where id = lake;
end;
$$;

revoke execute on function public.raise_catch_news(uuid, uuid, text, numeric, text, text),
	public.improve_skills(uuid, numeric, numeric, numeric, numeric), public.grow_reputation_for_catch(uuid, numeric)
	from public, anon, authenticated;
