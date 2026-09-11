create table public.profiles (
	id uuid primary key references auth.users (id) on delete cascade,
	display_name text not null,
	avatar_url text,
	money numeric(12, 2) not null default 5000,
	line_selection numeric(5, 2) not null default 25,
	rig_selection numeric(5, 2) not null default 25,
	bait_selection numeric(5, 2) not null default 25,
	watercraft numeric(5, 2) not null default 25,
	experience integer not null default 0,
	created_at timestamptz not null default now()
);

create table public.lakes (
	id uuid primary key default gen_random_uuid(),
	owner_id uuid not null references public.profiles (id) on delete cascade,
	name text not null,
	acres numeric(6, 2) not null,
	water_colour numeric(5, 2) not null,
	transparency numeric(5, 2) not null,
	weed numeric(5, 2) not null,
	silt numeric(5, 2) not null,
	bank_tidiness numeric(5, 2) not null,
	day_ticket_fee numeric(8, 2) not null,
	reputation numeric(5, 2) not null,
	has_bailiff boolean not null default false,
	pike_count integer not null default 0,
	pike_food numeric(8, 2) not null default 0,
	feed_stock jsonb not null,
	is_public boolean not null default true,
	simulated_until timestamptz not null default now(),
	created_at timestamptz not null default now()
);
create unique index lakes_one_per_owner on public.lakes (owner_id);

create table public.swims (
	id uuid primary key default gen_random_uuid(),
	lake_id uuid not null references public.lakes (id) on delete cascade,
	name text not null,
	position_x numeric(4, 3) not null,
	position_y numeric(4, 3) not null,
	bed_type text not null check (bed_type in ('gravel', 'clay', 'silt')),
	depth_feet numeric(4, 1) not null,
	feature text not null check (feature in ('open_water', 'weed_bed', 'snag', 'island_margin', 'reed_line'))
);
create index swims_by_lake on public.swims (lake_id);

create table public.carp (
	id uuid primary key default gen_random_uuid(),
	lake_id uuid not null references public.lakes (id) on delete cascade,
	name text not null,
	strain text not null check (strain in ('common', 'mirror', 'linear', 'leather', 'ghost')),
	weight_lb numeric(5, 2) not null,
	age_years integer not null,
	condition numeric(5, 2) not null,
	times_caught integer not null default 0
);
create index carp_by_lake on public.carp (lake_id);

create table public.catches (
	id uuid primary key default gen_random_uuid(),
	lake_id uuid not null references public.lakes (id) on delete cascade,
	carp_id uuid references public.carp (id) on delete set null,
	angler_id uuid references public.profiles (id) on delete set null,
	angler_name text not null,
	weight_lb numeric(5, 2) not null,
	swim_name text not null,
	rig text not null,
	bait text not null,
	hook_size integer not null,
	caught_at timestamptz not null default now()
);
create index catches_by_lake_recent on public.catches (lake_id, caught_at desc);
create index catches_by_angler_recent on public.catches (angler_id, caught_at desc);

create table public.lake_visits (
	id uuid primary key default gen_random_uuid(),
	lake_id uuid not null references public.lakes (id) on delete cascade,
	angler_id uuid references public.profiles (id) on delete set null,
	angler_name text not null,
	fee_paid numeric(8, 2) not null default 0,
	fish_caught integer not null default 0,
	visited_at timestamptz not null default now()
);
create index lake_visits_by_lake_recent on public.lake_visits (lake_id, visited_at desc);
