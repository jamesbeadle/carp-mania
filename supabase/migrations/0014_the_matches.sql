create table public.matches (
	id uuid primary key default gen_random_uuid(),
	lake_id uuid not null references public.lakes (id) on delete cascade,
	host_id uuid not null references public.profiles (id) on delete cascade,
	title text not null,
	starts_at timestamptz not null,
	ends_at timestamptz not null,
	entry_fee numeric(10, 2) not null,
	host_stake numeric(10, 2) not null,
	booking_fee numeric(10, 2) not null,
	most_catches_share integer not null check (most_catches_share between 0 and 100),
	pegs integer not null,
	status text not null default 'open' check (status in ('open', 'settled', 'cancelled')),
	created_at timestamptz not null default now(),
	settled_at timestamptz,
	check (ends_at > starts_at)
);
create index matches_by_lake_and_start on public.matches (lake_id, starts_at);
create index matches_open_by_end on public.matches (ends_at) where status = 'open';

create table public.match_entries (
	match_id uuid not null references public.matches (id) on delete cascade,
	angler_id uuid not null references public.profiles (id) on delete cascade,
	angler_name text not null,
	fisherman_id uuid references public.fishermen (id) on delete set null,
	entered_at timestamptz not null default now(),
	primary key (match_id, angler_id)
);
create index match_entries_by_angler on public.match_entries (angler_id);

create table public.trophies (
	id uuid primary key default gen_random_uuid(),
	match_id uuid references public.matches (id) on delete set null,
	profile_id uuid not null references public.profiles (id) on delete cascade,
	fisherman_id uuid references public.fishermen (id) on delete set null,
	angler_name text not null,
	kind text not null check (kind in ('most_catches', 'biggest_fish')),
	match_title text not null,
	lake_id uuid references public.lakes (id) on delete set null,
	lake_name text not null,
	catches integer not null,
	heaviest_lb numeric(5, 2) not null,
	prize numeric(10, 2) not null,
	won_at timestamptz not null default now()
);
create index trophies_by_fisherman on public.trophies (fisherman_id, won_at desc);
create index trophies_by_profile on public.trophies (profile_id, won_at desc);

alter table public.matches enable row level security;
alter table public.match_entries enable row level security;
alter table public.trophies enable row level security;
create policy "every match is on the noticeboard" on public.matches for select to authenticated using (true);
create policy "the entry list is public" on public.match_entries for select to authenticated using (true);
create policy "trophies are for showing off" on public.trophies for select to authenticated using (true);

alter table public.notifications drop constraint notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check check (kind in (
	'outbid', 'won', 'sold', 'unsold', 'arrived', 'quarantine_over', 'works_complete', 'record_set', 'big_catch_on_your_water', 'fish_died',
	'match_booked', 'match_cancelled', 'match_won', 'match_over'
));
alter table public.world_events drop constraint world_events_kind_check;
alter table public.world_events add constraint world_events_kind_check check (kind in (
	'big_catch', 'sale', 'record', 'new_water', 'island_built', 'fish_died', 'handover', 'match_announced', 'match_won'
));
