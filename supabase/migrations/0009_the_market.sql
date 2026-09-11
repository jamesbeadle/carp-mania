alter table public.lake_visits add column seed bigint;

create table public.listings (
	id uuid primary key default gen_random_uuid(),
	carp_id uuid not null references public.carp (id) on delete cascade,
	lake_id uuid not null references public.lakes (id) on delete cascade,
	seller_id uuid not null references public.profiles (id) on delete cascade,
	kind text not null check (kind in ('auction', 'buy_now')),
	starting_price numeric(10, 2) not null,
	reserve_price numeric(10, 2),
	buy_now_price numeric(10, 2),
	listing_fee numeric(10, 2) not null,
	ends_at timestamptz not null,
	latest_ends_at timestamptz not null,
	status text not null default 'open' check (status in ('open', 'sold', 'unsold', 'cancelled')),
	sold_price numeric(10, 2),
	buyer_id uuid references public.profiles (id) on delete set null,
	settled_at timestamptz,
	created_at timestamptz not null default now()
);
create index listings_by_status_and_end on public.listings (status, ends_at);
create index listings_by_lake on public.listings (lake_id);
create unique index listings_one_open_per_carp on public.listings (carp_id) where status = 'open';

create table public.bids (
	id uuid primary key default gen_random_uuid(),
	listing_id uuid not null references public.listings (id) on delete cascade,
	bidder_id uuid not null references public.profiles (id) on delete cascade,
	amount numeric(10, 2) not null,
	transport_cost numeric(10, 2) not null default 0,
	status text not null default 'leading' check (status in ('leading', 'outbid', 'won', 'refunded')),
	placed_at timestamptz not null default now()
);
create index bids_by_listing_recent on public.bids (listing_id, placed_at desc);
create index bids_by_bidder on public.bids (bidder_id, status);

alter table public.carp_transfers
	add constraint carp_transfers_listing_id_fkey foreign key (listing_id) references public.listings (id) on delete set null;

alter table public.listings enable row level security;
alter table public.bids enable row level security;
create policy "the market is readable by everyone signed in" on public.listings
	for select to authenticated using (true);
create policy "bids are readable by everyone signed in" on public.bids
	for select to authenticated using (true);

create or replace function public.is_carp_for_sale(fish uuid) returns boolean
language sql stable security definer set search_path = public as $$
	select exists (select 1 from public.listings where carp_id = fish and status = 'open');
$$;

drop policy "carp follow lake visibility" on public.carp;
create policy "carp follow lake visibility and a fish for sale is seen by all" on public.carp
	for select to authenticated using (public.is_lake_visible(lake_id) or public.is_carp_for_sale(id));
drop policy "catches follow lake visibility" on public.catches;
create policy "catches follow lake visibility and a fish for sale is seen by all" on public.catches
	for select to authenticated using (public.is_lake_visible(lake_id) or public.is_carp_for_sale(carp_id));
drop policy "transfers follow the visibility of the lakes they touch" on public.carp_transfers;
create policy "transfers follow the lakes they touch and a fish for sale is seen by all" on public.carp_transfers
	for select to authenticated using (public.is_lake_visible(from_lake_id) or public.is_lake_visible(to_lake_id) or public.is_carp_for_sale(carp_id));
