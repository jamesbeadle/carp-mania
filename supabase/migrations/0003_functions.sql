create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
	insert into public.profiles (id, display_name, avatar_url)
	values (
		new.id,
		coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
		new.raw_user_meta_data ->> 'avatar_url'
	);
	return new;
end;
$$;

create trigger on_auth_user_created
	after insert on auth.users
	for each row execute procedure public.handle_new_user();

create or replace function public.pay_day_ticket(lake uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	fee numeric;
	owner uuid;
	angler_name text;
	visit_id uuid;
begin
	select day_ticket_fee, owner_id into fee, owner from public.lakes where id = lake and is_public;
	if owner is null then raise exception 'lake is not open to anglers'; end if;
	if owner = auth.uid() then fee := 0; end if;
	if (select money from public.profiles where id = auth.uid()) < fee then raise exception 'not enough money for the day ticket'; end if;

	update public.profiles set money = money - fee where id = auth.uid();
	update public.profiles set money = money + fee where id = owner;
	select display_name into angler_name from public.profiles where id = auth.uid();

	insert into public.lake_visits (lake_id, angler_id, angler_name, fee_paid)
	values (lake, auth.uid(), angler_name, fee) returning id into visit_id;
	return visit_id;
end;
$$;

create or replace function public.record_catch(
	visit uuid, fish uuid, swim_name text, rig text, bait text, hook_size integer,
	line_gain numeric, rig_gain numeric, bait_gain numeric, watercraft_gain numeric
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	lake uuid;
	fish_weight numeric;
	angler_name text;
	catch_id uuid;
	reputation_gain numeric;
	largest_gain constant numeric := 2;
begin
	select lake_id into lake from public.lake_visits where id = visit and angler_id = auth.uid();
	if lake is null then raise exception 'no day ticket for this visit'; end if;
	select weight_lb into fish_weight from public.carp where id = fish and lake_id = lake;
	if fish_weight is null then raise exception 'that carp is not in this lake'; end if;

	select display_name into angler_name from public.profiles where id = auth.uid();
	insert into public.catches (lake_id, carp_id, angler_id, angler_name, weight_lb, swim_name, rig, bait, hook_size)
	values (lake, fish, auth.uid(), angler_name, fish_weight, swim_name, rig, bait, hook_size) returning id into catch_id;

	update public.carp set times_caught = times_caught + 1 where id = fish;
	update public.lake_visits set fish_caught = fish_caught + 1 where id = visit;

	reputation_gain := (0.05 + greatest(0, fish_weight - 20) * 0.05 + greatest(0, fish_weight - 30) * 0.12);
	update public.lakes set reputation = least(100, reputation + reputation_gain * (1 - reputation / 100)) where id = lake;

	update public.profiles set
		line_selection = least(100, line_selection + least(largest_gain, greatest(0, line_gain))),
		rig_selection = least(100, rig_selection + least(largest_gain, greatest(0, rig_gain))),
		bait_selection = least(100, bait_selection + least(largest_gain, greatest(0, bait_gain))),
		watercraft = least(100, watercraft + least(largest_gain, greatest(0, watercraft_gain))),
		experience = experience + 1
	where id = auth.uid();
	return catch_id;
end;
$$;
