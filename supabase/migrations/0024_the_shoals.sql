create table public.carp_shoals (
	id uuid primary key default gen_random_uuid(),
	lake_id uuid not null references public.lakes (id) on delete cascade,
	size_band text not null check (size_band in ('fry', 'singles', 'doubles', 'twenties', 'thirties', 'forties', 'fifties')),
	count integer not null check (count >= 0),
	average_weight_lb numeric(5, 2) not null check (average_weight_lb > 0),
	weight_spread_lb numeric(5, 2) not null default 1 check (weight_spread_lb >= 0),
	age_years integer not null default 1,
	condition numeric(5, 2) not null default 80,
	origin text not null default 'farm' check (origin in ('farm', 'wild', 'bred', 'classic')),
	farm_pack_id text,
	transit_until timestamptz,
	quarantine_until timestamptz,
	created_at timestamptz not null default now()
);
create index carp_shoals_by_lake on public.carp_shoals (lake_id);
alter table public.carp_shoals enable row level security;
create policy "shoals follow lake visibility" on public.carp_shoals for select to authenticated using (public.is_lake_visible(lake_id));
create policy "owners manage shoals" on public.carp_shoals for all to authenticated using (public.is_lake_owner(lake_id)) with check (public.is_lake_owner(lake_id));

alter table public.carp_transfers add column head_count integer not null default 1 check (head_count >= 1);

create or replace function public.pack_sold_count(pack text) returns integer
language sql stable as $$
	select coalesce(sum(head_count), 0)::integer from public.carp_transfers where farm_pack_id = pack and kind = 'farm_delivery';
$$;

create or replace function public.assert_lake_has_room(the_lake public.lakes, incoming_lb numeric) returns void
language plpgsql stable security definer set search_path = public as $$
declare
	heaviest_stocking_lb_per_acre constant numeric := 500;
	smallest_water_acres constant numeric := 0.1;
	stocked_lb numeric;
	shoaled_lb numeric;
begin
	select coalesce(sum(weight_lb), 0) into stocked_lb from public.carp where lake_id = the_lake.id and is_catalogued;
	select coalesce(sum(count * average_weight_lb), 0) into shoaled_lb from public.carp_shoals where lake_id = the_lake.id;
	if (stocked_lb + shoaled_lb + incoming_lb) / greatest(smallest_water_acres, the_lake.acres) > heaviest_stocking_lb_per_acre then
		raise exception 'That order would put your water over % lb an acre; the farm won''t deliver to an overstocked lake', heaviest_stocking_lb_per_acre;
	end if;
end;
$$;

create or replace function public.buy_farm_shoal(player uuid, pack text, shoal jsonb, fish_price numeric, transport numeric, arrives timestamptz, quarantined_until timestamptz, kilometres numeric) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	the_lake public.lakes;
	head_count integer;
	shoal_id uuid;
begin
	the_lake := public.current_lake_of(player);
	if the_lake.id is null then raise exception 'You need a water of your own before the farm will deliver'; end if;
	head_count := (shoal ->> 'count')::integer;
	if head_count is null or head_count <= 0 then raise exception 'There is nothing on the order'; end if;
	perform public.assert_lake_has_room(the_lake, head_count * (shoal ->> 'average_weight_lb')::numeric);
	perform public.debit_money(player, fish_price + transport, 'That order');
	insert into public.carp_shoals (lake_id, size_band, count, average_weight_lb, weight_spread_lb, age_years, condition, origin, farm_pack_id, transit_until, quarantine_until)
	values (the_lake.id, shoal ->> 'size_band', head_count, (shoal ->> 'average_weight_lb')::numeric, (shoal ->> 'weight_spread_lb')::numeric,
		(shoal ->> 'age_years')::integer, (shoal ->> 'condition')::numeric, 'farm', pack, arrives, quarantined_until)
	returning id into shoal_id;
	insert into public.carp_transfers (carp_id, carp_name, kind, to_lake_id, price, transport_cost, distance_km, farm_pack_id, head_count, departed_at, arrives_at, quarantine_until)
	values (null, format('A shoal of %s from the farm', head_count), 'farm_delivery', the_lake.id, fish_price, transport, kilometres, pack, head_count, now(), arrives, quarantined_until);
	return shoal_id;
end;
$$;

revoke execute on function public.buy_farm_shoal(uuid, text, jsonb, numeric, numeric, timestamptz, timestamptz, numeric) from public, anon, authenticated;
grant execute on function public.buy_farm_shoal(uuid, text, jsonb, numeric, numeric, timestamptz, timestamptz, numeric) to service_role;
