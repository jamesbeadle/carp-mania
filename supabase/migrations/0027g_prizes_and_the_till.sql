create or replace function public.biggest_fish_in_the_game()
returns table (carp_id uuid, carp_name text, weight_lb numeric, lake_id uuid, lake_name text, is_open boolean)
language sql stable security definer set search_path = public as $$
	select fish.id, fish.name, fish.weight_lb, water.id, water.name, (water.is_public and water.is_setup_complete)
	from public.carp as fish join public.lakes as water on water.id = fish.lake_id
	where fish.is_catalogued
	order by fish.weight_lb desc, fish.id limit 1;
$$;

create or replace function public.buy_tackle_on_credit(player uuid, item text, amount numeric, price numeric, spoils timestamptz, brand text) returns numeric
language plpgsql security definer set search_path = public as $$
declare
	credit numeric;
	from_credit numeric;
begin
	if amount <= 0 then raise exception 'Buy at least one'; end if;
	select coalesce(sum(tackle_credits.amount), 0) into credit from public.tackle_credits where profile_id = player and tackle_credits.brand = buy_tackle_on_credit.brand;
	from_credit := least(credit, price);
	if from_credit > 0 then update public.tackle_credits set amount = tackle_credits.amount - from_credit where profile_id = player and tackle_credits.brand = buy_tackle_on_credit.brand; end if;
	if price - from_credit > 0 then perform public.debit_money(player, price - from_credit, 'That tackle'); end if;
	perform public.add_tackle(player, item, amount, spoils);
	return from_credit;
end;
$$;

create or replace function public.strike_prototype(player uuid, item text) returns void
language plpgsql security definer set search_path = public as $$
declare
	struck public.prototypes;
begin
	update public.prototypes set is_destroyed = true, destroyed_at = now() where item_id = item and holder_id = player and not is_destroyed returning * into struck;
	if struck.id is null then return; end if;
	perform public.send_notification(player, 'prototype_lost', struck.item_id || ' is gone', 'The one-of-one snapped. It is struck from the board, with the date.', '/world/hall-of-fame');
	insert into public.world_events (kind, lake_id, payload)
	select 'prototype_lost', water.id, jsonb_build_object('itemId', struck.item_id, 'designId', struck.design_id, 'number', struck.number, 'anglerId', player, 'anglerName', struck.holder_name)
	from public.lakes as water where water.owner_id = player order by water.created_at limit 1;
end;
$$;

revoke execute on function public.buy_tackle_on_credit(uuid, text, numeric, numeric, timestamptz, text), public.strike_prototype(uuid, text) from public, anon, authenticated;
grant execute on function public.buy_tackle_on_credit(uuid, text, numeric, numeric, timestamptz, text), public.strike_prototype(uuid, text) to service_role;
grant execute on function public.biggest_fish_in_the_game() to authenticated, anon;
