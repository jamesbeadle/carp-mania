alter table public.lakes
	add column is_booking_on boolean not null default false,
	add column syndicate_places_for_sale integer not null default 0 check (syndicate_places_for_sale >= 0),
	add column syndicate_price numeric(8, 2) not null default 0 check (syndicate_price >= 0);

create table public.bookings (
	id uuid primary key default gen_random_uuid(),
	lake_id uuid not null references public.lakes (id) on delete cascade,
	swim_id uuid not null references public.swims (id) on delete cascade,
	angler_id uuid not null references public.profiles (id) on delete cascade,
	ticket_product_id uuid references public.ticket_products (id) on delete set null,
	fishery_day integer not null,
	fee_paid numeric(8, 2) not null default 0,
	status text not null default 'booked' check (status in ('booked', 'fished', 'forfeited', 'cancelled')),
	booked_at timestamptz not null default now(),
	unique (swim_id, fishery_day)
);
create index bookings_by_lake_day on public.bookings (lake_id, fishery_day);
alter table public.bookings enable row level security;
create policy "bookings follow lake visibility" on public.bookings for select to authenticated using (public.is_lake_visible(lake_id));

create table public.syndicate_places (
	id uuid primary key default gen_random_uuid(),
	lake_id uuid not null references public.lakes (id) on delete cascade,
	angler_id uuid not null references public.profiles (id) on delete cascade,
	fishery_year integer not null,
	price numeric(8, 2) not null,
	bought_at timestamptz not null default now(),
	unique (lake_id, angler_id, fishery_year)
);
alter table public.syndicate_places enable row level security;
create policy "places follow lake visibility" on public.syndicate_places for select to authenticated using (public.is_lake_visible(lake_id));

create or replace function public.fishery_day_now() returns integer
language sql stable as $$
	select floor(extract(epoch from now()) * 1000 / 3600000)::integer;
$$;

create or replace function public.fishery_year_now() returns integer
language sql stable as $$
	select floor(public.fishery_day_now() / 365)::integer;
$$;

create or replace function public.is_syndicate_member(lake uuid, angler uuid) returns boolean
language sql stable as $$
	select exists (select 1 from public.syndicate_places where lake_id = lake and angler_id = angler and fishery_year = public.fishery_year_now());
$$;

create or replace function public.is_syndicate_water(lake uuid) returns boolean
language sql stable as $$
	select syndicate_price > 0 from public.lakes where id = lake;
$$;

create or replace function public.set_booking_on(lake uuid, is_on boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
	if not public.is_lake_owner(lake) then raise exception 'That is not your water'; end if;
	update public.lakes set is_booking_on = is_on where id = lake;
end;
$$;

create or replace function public.sell_syndicate_places(lake uuid, places integer, price numeric) returns void
language plpgsql security definer set search_path = public as $$
begin
	if not public.is_lake_owner(lake) then raise exception 'That is not your water'; end if;
	if places < 0 or price < 0 then raise exception 'Places and the price must be nought or more'; end if;
	update public.lakes set syndicate_places_for_sale = places, syndicate_price = price where id = lake;
end;
$$;

create or replace function public.buy_syndicate_place(lake uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	the_lake public.lakes;
	place_id uuid;
begin
	select * into the_lake from public.lakes where id = lake and is_public and is_setup_complete for update;
	if the_lake.id is null then raise exception 'That water is not open'; end if;
	if the_lake.syndicate_places_for_sale <= 0 or the_lake.syndicate_price <= 0 then raise exception 'No syndicate places are on sale here'; end if;
	if public.is_syndicate_member(lake, auth.uid()) then raise exception 'You are already in the syndicate this year'; end if;
	perform public.debit_money(auth.uid(), the_lake.syndicate_price, 'The syndicate place');
	perform public.credit_money(the_lake.owner_id, the_lake.syndicate_price);
	insert into public.syndicate_places (lake_id, angler_id, fishery_year, price) values (lake, auth.uid(), public.fishery_year_now(), the_lake.syndicate_price) returning id into place_id;
	update public.lakes set syndicate_places_for_sale = syndicate_places_for_sale - 1 where id = lake;
	return place_id;
end;
$$;

grant execute on function public.set_booking_on(uuid, boolean), public.sell_syndicate_places(uuid, integer, numeric), public.buy_syndicate_place(uuid), public.is_syndicate_member(uuid, uuid), public.is_syndicate_water(uuid), public.fishery_day_now(), public.fishery_year_now() to authenticated;
