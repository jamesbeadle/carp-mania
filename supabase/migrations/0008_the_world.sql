create table public.world_events (
	id uuid primary key default gen_random_uuid(),
	kind text not null check (kind in ('big_catch', 'sale', 'record', 'new_water', 'island_built')),
	lake_id uuid not null references public.lakes (id) on delete cascade,
	other_lake_id uuid references public.lakes (id) on delete set null,
	payload jsonb not null default '{}'::jsonb,
	created_at timestamptz not null default now()
);
create index world_events_recent on public.world_events (created_at desc);

create table public.favourite_lakes (
	profile_id uuid not null references public.profiles (id) on delete cascade,
	lake_id uuid not null references public.lakes (id) on delete cascade,
	created_at timestamptz not null default now(),
	primary key (profile_id, lake_id)
);

alter table public.world_events enable row level security;
alter table public.favourite_lakes enable row level security;
create policy "the live feed is readable by everyone signed in" on public.world_events
	for select to authenticated using (true);
create policy "players keep their own favourites" on public.favourite_lakes
	for all to authenticated using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create index carp_by_weight on public.carp (weight_lb desc);
create index catches_by_weight on public.catches (weight_lb desc);
create index lakes_by_reputation on public.lakes (reputation desc);

do $$ begin
	if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
		and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'world_events') then
		alter publication supabase_realtime add table public.world_events;
	end if;
end $$;

create view public.world_pins with (security_invoker = true) as
select
	lake.id,
	lake.name,
	owner.display_name as owner_name,
	lake.region,
	lake.latitude,
	lake.longitude,
	lake.reputation,
	(select max(weight_lb) from public.carp where lake_id = lake.id and is_catalogued) as heaviest_lb,
	lake.acres,
	lake.day_ticket_fee,
	(
		select count(distinct angler_id)::integer from public.lake_visits
		where lake_id = lake.id and angler_id is not null and visited_at > now() - interval '10 minutes'
	) as anglers_on_bank_now
from public.lakes as lake
join public.profiles as owner on owner.id = lake.owner_id
where lake.is_public and lake.is_setup_complete and lake.latitude is not null;
