-- An angler fishes under a name of their own: one word, three to twenty-four letters and numbers, nobody else's.
-- New accounts start as their first name, numbered if taken; existing accounts are given the same, and the name follows
-- the angler through every catch, visit and piece of news when it changes.

create or replace function public.angler_name_of_first_name(full_name text) returns text
language sql immutable as $$
	select case when length(cleaned) >= 3 then cleaned else 'Angler' end
	from (select left(regexp_replace(split_part(coalesce(full_name, ''), ' ', 1), '[^A-Za-z0-9]', '', 'g'), 24) as cleaned) as first;
$$;

create or replace function public.is_angler_name(candidate text) returns boolean
language sql immutable as $$
	select candidate ~ '^[A-Za-z0-9]{3,24}$';
$$;

create or replace function public.free_angler_name(wanted text, angler uuid) returns text
language plpgsql stable security definer set search_path = public as $$
declare
	candidate text := wanted;
	suffix integer := 2;
begin
	while exists (select 1 from public.profiles where lower(display_name) = lower(candidate) and id <> angler) loop
		candidate := left(wanted, 24 - length(suffix::text)) || suffix;
		suffix := suffix + 1;
	end loop;
	return candidate;
end;
$$;

create or replace function public.follow_the_angler_name(angler uuid, old_name text, new_name text) returns void
language plpgsql security definer set search_path = public as $$
begin
	update public.profiles set display_name = new_name where id = angler;
	update public.fishermen set name = new_name where profile_id = angler and name = old_name;
	update public.catches set angler_name = new_name where angler_id = angler and angler_name = old_name;
	update public.catches set owner_name = new_name where owner_name = old_name and lake_id in (select id from public.lakes where owner_id = angler);
	update public.lake_visits set angler_name = new_name where angler_id = angler and angler_name = old_name;
	update public.world_events set payload = payload || jsonb_build_object('anglerName', new_name) where payload ->> 'anglerId' = angler::text and payload ->> 'anglerName' = old_name;
end;
$$;

create or replace function public.rename_angler(new_name text) returns void
language plpgsql security definer set search_path = public as $$
begin
	if auth.uid() is null then raise exception 'No angler is signed in'; end if;
	if not public.is_angler_name(new_name) then raise exception 'An angler name is 3–24 letters and numbers, no spaces'; end if;
	if exists (select 1 from public.profiles where lower(display_name) = lower(new_name) and id <> auth.uid()) then
		raise exception 'Another angler already fishes as %', new_name;
	end if;
	perform public.follow_the_angler_name(auth.uid(), (select display_name from public.profiles where id = auth.uid()), new_name);
end;
$$;
revoke execute on function public.follow_the_angler_name(uuid, text, text), public.free_angler_name(text, uuid) from public, anon, authenticated;
grant execute on function public.rename_angler(text) to authenticated;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
	first_generation constant integer := 1;
	first_name text := public.angler_name_of_first_name(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)));
	angler_name text := public.free_angler_name(first_name, new.id);
begin
	insert into public.profiles (id, display_name, avatar_url) values (new.id, angler_name, new.raw_user_meta_data ->> 'avatar_url');
	perform public.begin_fisherman(new.id, angler_name, first_generation);
	perform public.grant_starter_kit(new.id);
	return new;
end;
$$;

create or replace function public.retire_fisherman(player uuid, heir_name text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	heir_starting_skill constant numeric := 40;
	old public.fishermen;
	heir uuid;
	skill_now numeric;
	experience_now integer;
begin
	select * into old from public.fishermen where id = (select current_fisherman_id from public.profiles where id = player) for update;
	if old.id is null then raise exception 'There is no fisherman to retire'; end if;
	if public.diary_age_of(old, now()) < old.retires_at_age then raise exception 'The old man has years in him yet'; end if;
	if not public.is_angler_name(heir_name) then raise exception 'An heir''s name is 3–24 letters and numbers, no spaces'; end if;
	if exists (select 1 from public.profiles where lower(display_name) = lower(heir_name) and id <> player) then
		raise exception 'Another angler already fishes as %', heir_name;
	end if;
	select (line_selection + rig_selection + bait_selection + watercraft) / 4, experience into skill_now, experience_now from public.profiles where id = player;
	update public.fishermen set
		retired_at = now(),
		final_skill = skill_now,
		final_experience = experience_now,
		catches = (select count(*) from public.catches where fisherman_id = old.id),
		personal_best_lb = (select max(weight_lb) from public.catches where fisherman_id = old.id)
	where id = old.id;
	heir := public.begin_fisherman(player, heir_name, old.generation + 1);
	update public.profiles set
		display_name = heir_name,
		line_selection = heir_starting_skill, rig_selection = heir_starting_skill, bait_selection = heir_starting_skill, watercraft = heir_starting_skill,
		experience = 0
	where id = player;
	insert into public.world_events (kind, lake_id, payload)
	select 'handover', id, jsonb_build_object('lakeName', name, 'heirName', heir_name, 'oldName', old.name, 'generation', old.generation + 1)
	from public.lakes where owner_id = player;
	return heir;
end;
$$;

do $$
declare
	angler record;
begin
	for angler in select id, display_name from public.profiles order by created_at loop
		perform public.follow_the_angler_name(angler.id, angler.display_name, public.free_angler_name(public.angler_name_of_first_name(angler.display_name), angler.id));
	end loop;
end;
$$;

create unique index profiles_one_angler_per_name on public.profiles (lower(display_name));
alter table public.profiles add constraint profiles_display_name_is_an_angler_name check (public.is_angler_name(display_name));
