create table public.ticket_products (
	id uuid primary key default gen_random_uuid(),
	lake_id uuid not null references public.lakes (id) on delete cascade,
	kind text not null check (kind in ('day', 'night', 'twenty_four_hours', 'multi_day')),
	days integer not null default 1 check (days between 1 and 7),
	price numeric(8, 2) not null check (price >= 0),
	is_on_sale boolean not null default true,
	created_at timestamptz not null default now()
);
create index ticket_products_by_lake on public.ticket_products (lake_id);
alter table public.ticket_products enable row level security;
create policy "tickets follow lake visibility" on public.ticket_products for select using (
	exists (select 1 from public.lakes where id = lake_id and ((is_public and is_setup_complete) or owner_id = auth.uid()))
);
create policy "owners write their ticket book" on public.ticket_products for all using (public.is_lake_owner(lake_id)) with check (public.is_lake_owner(lake_id));

alter table public.lakes add column is_barbed_banned boolean not null default false;
alter table public.lake_visits
	add column ticket_product_id uuid references public.ticket_products (id) on delete set null,
	add column session_from_hour integer not null default 5,
	add column session_to_hour integer not null default 24,
	add column sessions_left integer not null default 1,
	add column expires_at timestamptz;

create or replace function public.ticket_window_from(kind text) returns integer
language sql immutable as $$
	select case kind when 'night' then 19 else 7 end;
$$;

create or replace function public.ticket_window_to(kind text) returns integer
language sql immutable as $$
	select case kind when 'day' then 19 when 'night' then 31 else 31 end;
$$;

insert into public.ticket_products (lake_id, kind, days, price)
select id, 'day', 1, day_ticket_fee from public.lakes;
insert into public.ticket_products (lake_id, kind, days, price)
select id, 'twenty_four_hours', 1, round(day_ticket_fee * 2.5 / 5) * 5 from public.lakes;

create or replace function public.day_product_of(lake uuid) returns uuid
language sql stable as $$
	select id from public.ticket_products where lake_id = lake and kind = 'day' and is_on_sale order by price limit 1;
$$;

create or replace function public.seed_ticket_book() returns trigger
language plpgsql security definer set search_path = public as $$
declare
	twenty_four_hour_factor constant numeric := 2.5;
	price_step constant numeric := 5;
begin
	insert into public.ticket_products (lake_id, kind, days, price) values
		(new.id, 'day', 1, new.day_ticket_fee),
		(new.id, 'twenty_four_hours', 1, round(new.day_ticket_fee * twenty_four_hour_factor / price_step) * price_step);
	return new;
end;
$$;
create trigger lakes_seed_ticket_book after insert on public.lakes for each row execute function public.seed_ticket_book();

drop view public.lake_summaries;
create view public.lake_summaries with (security_invoker = true) as
select
	water.*,
	owner.display_name as owner_name,
	(select count(*)::integer from public.carp where carp.lake_id = water.id) as carp_count,
	(select coalesce(max(carp.weight_lb), 0) from public.carp where carp.lake_id = water.id) as heaviest_lb,
	(select count(*)::integer from public.swims where swims.lake_id = water.id) as swim_count,
	(select coalesce(min(price), water.day_ticket_fee) from public.ticket_products where lake_id = water.id and is_on_sale) as from_price
from public.lakes as water
join public.profiles as owner on owner.id = water.owner_id;
