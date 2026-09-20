create table public.awards (
	id uuid primary key default gen_random_uuid(),
	profile_id uuid not null references public.profiles (id) on delete cascade,
	award_key text not null,
	won_at timestamptz not null default now(),
	catch_id uuid references public.catches (id) on delete set null,
	unique (profile_id, award_key)
);
create index awards_by_profile on public.awards (profile_id, won_at desc);
alter table public.awards enable row level security;
create policy "awards are public" on public.awards for select to authenticated using (true);

alter table public.catches add column hour_of_day integer, add column visit_id uuid references public.lake_visits (id) on delete set null;

alter table public.notifications drop constraint notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check check (kind in (
	'outbid', 'won', 'sold', 'unsold', 'arrived', 'quarantine_over', 'works_complete', 'record_set', 'big_catch_on_your_water', 'fish_died',
	'match_booked', 'match_cancelled', 'match_won', 'match_over', 'record_lost', 'board_place_lost',
	'award_won', 'bounty_posted', 'bounty_won', 'prototype_lost'
));
alter table public.world_events drop constraint world_events_kind_check;
alter table public.world_events add constraint world_events_kind_check check (kind in (
	'big_catch', 'sale', 'record', 'new_water', 'island_built', 'fish_died', 'handover', 'match_announced', 'match_won',
	'award', 'bounty_posted', 'bounty_won', 'prototype_lost'
));

create table public.bounties (
	id uuid primary key default gen_random_uuid(),
	lake_id uuid not null references public.lakes (id) on delete cascade,
	swim_id uuid references public.swims (id) on delete set null,
	swim_name text,
	kind text not null check (kind in ('top_of_the_water', 'named_fish', 'peg_prize', 'over_the_line', 'hard_graft')),
	band text not null check (band in ('easy', 'moderate', 'hard', 'very_hard')),
	target_carp_id uuid references public.carp (id) on delete set null,
	target_carp_name text,
	target_weight_lb numeric(5, 2),
	sponsor_brand text not null,
	posted_by uuid references public.profiles (id) on delete set null,
	prize_kind text not null check (prize_kind in ('money', 'brand_credit', 'hooks_tin', 'batch_spool', 'bait_drum', 'sponsorship', 'prototype', 'peg_at_a_legend', 'stocked_fish')),
	prize_money numeric(10, 2) not null default 0,
	prize_brand text,
	prize_item_id text,
	prize_quantity numeric(10, 2) not null default 0,
	prize_design_id text,
	opens_at timestamptz not null default now(),
	ends_at timestamptz not null,
	status text not null default 'open' check (status in ('open', 'won', 'unclaimed')),
	winner_id uuid references public.profiles (id) on delete set null,
	winner_name text,
	winning_catch_id uuid references public.catches (id) on delete set null,
	settled_at timestamptz
);
create index bounties_open_by_lake on public.bounties (lake_id, status);
alter table public.bounties enable row level security;
create policy "bounties are public" on public.bounties for select to authenticated using (true);

create table public.prototypes (
	id uuid primary key default gen_random_uuid(),
	item_id text not null unique,
	design_id text not null,
	brand text not null,
	number integer not null,
	holder_id uuid references public.profiles (id) on delete set null,
	holder_name text not null,
	bounty_id uuid references public.bounties (id) on delete set null,
	won_at timestamptz not null default now(),
	fishery_year integer not null,
	is_destroyed boolean not null default false,
	destroyed_at timestamptz,
	unique (design_id, number)
);
alter table public.prototypes enable row level security;
create policy "prototypes are public" on public.prototypes for select to authenticated using (true);

create table public.sponsorships (
	profile_id uuid not null references public.profiles (id) on delete cascade,
	brand text not null,
	runs_until timestamptz not null,
	primary key (profile_id, brand)
);
alter table public.sponsorships enable row level security;
create policy "anglers see their own sponsorships" on public.sponsorships for select to authenticated using (profile_id = auth.uid());

create table public.tackle_credits (
	profile_id uuid not null references public.profiles (id) on delete cascade,
	brand text not null,
	amount numeric(10, 2) not null default 0 check (amount >= 0),
	primary key (profile_id, brand)
);
alter table public.tackle_credits enable row level security;
create policy "anglers see their own credit" on public.tackle_credits for select to authenticated using (profile_id = auth.uid());
