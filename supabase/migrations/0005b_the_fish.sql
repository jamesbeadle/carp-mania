alter table public.carp
	drop constraint carp_strain_check,
	add constraint carp_strain_check check (strain in ('common', 'mirror', 'linear', 'fully_scaled', 'leather', 'ghost')),
	add column origin text not null default 'classic' check (origin in ('farm', 'wild', 'bred', 'classic')),
	add column origin_lake_id uuid references public.lakes (id) on delete set null,
	add column fame integer not null default 0,
	add column is_catalogued boolean not null default true,
	add column transit_until timestamptz,
	add column quarantine_until timestamptz;
update public.carp set origin_lake_id = lake_id;

create table public.carp_transfers (
	id uuid primary key default gen_random_uuid(),
	carp_id uuid references public.carp (id) on delete set null,
	carp_name text not null,
	kind text not null check (kind in ('sale', 'dealer_purchase', 'farm_delivery', 'dealer_sale')),
	listing_id uuid,
	from_lake_id uuid references public.lakes (id) on delete set null,
	to_lake_id uuid references public.lakes (id) on delete set null,
	price numeric(10, 2) not null,
	commission numeric(10, 2) not null default 0,
	transport_cost numeric(10, 2) not null default 0,
	distance_km numeric(8, 1) not null default 0,
	farm_band text check (farm_band in ('stockies', 'doubles', 'mid_doubles', 'twenties')),
	departed_at timestamptz not null default now(),
	arrives_at timestamptz not null default now(),
	quarantine_until timestamptz
);
create index carp_transfers_by_carp on public.carp_transfers (carp_id);
create index carp_transfers_from_lake_recent on public.carp_transfers (from_lake_id, departed_at desc);
create index carp_transfers_to_lake_recent on public.carp_transfers (to_lake_id, departed_at desc);
create index carp_transfers_by_kind_recent on public.carp_transfers (kind, departed_at desc);
