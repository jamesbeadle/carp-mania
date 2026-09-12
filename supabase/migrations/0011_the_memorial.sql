create table public.carp_memorial (
	id uuid primary key,
	lake_id uuid references public.lakes (id) on delete set null,
	lake_name text not null,
	name text not null,
	strain text not null,
	weight_lb numeric(5, 2) not null,
	age_years integer not null,
	origin text not null,
	origin_lake_id uuid references public.lakes (id) on delete set null,
	fame integer not null default 0,
	times_caught integer not null default 0,
	died_at timestamptz not null default now(),
	death_cause text not null check (death_cause in ('pike', 'old_age'))
);
create index carp_memorial_by_fame on public.carp_memorial (fame desc, weight_lb desc);
create index carp_memorial_by_lake_recent on public.carp_memorial (lake_id, died_at desc);
alter table public.carp_memorial enable row level security;
create policy "legends are remembered by everyone" on public.carp_memorial for select to authenticated using (true);

alter table public.catches drop constraint catches_carp_id_fkey;
alter table public.carp_transfers drop constraint carp_transfers_carp_id_fkey;

alter table public.catches add column owner_name text;
update public.catches set owner_name = (
	select owner.display_name from public.lakes as water join public.profiles as owner on owner.id = water.owner_id where water.id = catches.lake_id
);

alter table public.notifications drop constraint notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check check (kind in (
	'outbid', 'won', 'sold', 'unsold', 'arrived', 'quarantine_over', 'works_complete', 'record_set', 'big_catch_on_your_water', 'fish_died'
));
alter table public.world_events drop constraint world_events_kind_check;
alter table public.world_events add constraint world_events_kind_check check (kind in (
	'big_catch', 'sale', 'record', 'new_water', 'island_built', 'fish_died'
));

create or replace function public.bury_carp(fish uuid[], cause text) returns integer
language plpgsql security definer set search_path = public as $$
declare
	the_carp public.carp;
	sale public.listings;
	buried integer := 0;
begin
	for the_carp in select * from public.carp where id = any(fish) for update loop
		for sale in select * from public.listings where carp_id = the_carp.id and status = 'open' for update loop
			perform public.refund_leading_bid(sale.id, 'refunded');
			update public.listings set status = 'cancelled', settled_at = now() where id = sale.id;
		end loop;
		insert into public.carp_memorial (id, lake_id, lake_name, name, strain, weight_lb, age_years, origin, origin_lake_id, fame, times_caught, death_cause)
		select the_carp.id, the_carp.lake_id, water.name, the_carp.name, the_carp.strain, the_carp.weight_lb, the_carp.age_years,
			the_carp.origin, the_carp.origin_lake_id, the_carp.fame, the_carp.times_caught, cause
		from public.lakes as water where water.id = the_carp.lake_id;
		delete from public.carp where id = the_carp.id;
		buried := buried + 1;
	end loop;
	return buried;
end;
$$;

revoke execute on function public.bury_carp(uuid[], text) from public, anon, authenticated;
grant execute on function public.bury_carp(uuid[], text) to service_role;
