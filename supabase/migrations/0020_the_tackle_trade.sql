create table public.tackle_owned (
	id uuid primary key default gen_random_uuid(),
	profile_id uuid not null references public.profiles (id) on delete cascade,
	item_id text not null,
	quantity numeric(10, 2) not null default 0 check (quantity >= 0),
	spoils_at timestamptz,
	bought_at timestamptz not null default now(),
	unique (profile_id, item_id)
);
create index tackle_owned_by_profile on public.tackle_owned (profile_id);
alter table public.tackle_owned enable row level security;
create policy "anglers see their own tackle" on public.tackle_owned for select to authenticated using (profile_id = auth.uid());

alter table public.catches add column rod_item_id text, add column reel_item_id text;
alter table public.lakes add column shop_tier text not null default 'starter' check (shop_tier in ('starter', 'club', 'specialist', 'custom'));

create or replace function public.add_tackle(player uuid, item text, amount numeric, spoils timestamptz) returns void
language plpgsql security definer set search_path = public as $$
begin
	insert into public.tackle_owned (profile_id, item_id, quantity, spoils_at, bought_at)
	values (player, item, amount, spoils, now())
	on conflict (profile_id, item_id) do update
		set quantity = public.tackle_owned.quantity + excluded.quantity, spoils_at = excluded.spoils_at, bought_at = now();
end;
$$;

create or replace function public.buy_tackle(player uuid, item text, amount numeric, price numeric, spoils timestamptz) returns void
language plpgsql security definer set search_path = public as $$
begin
	if amount <= 0 then raise exception 'Buy at least one'; end if;
	perform public.debit_money(player, price, 'That tackle');
	perform public.add_tackle(player, item, amount, spoils);
end;
$$;

create or replace function public.use_tackle(player uuid, item text, amount numeric) returns void
language sql security definer set search_path = public as $$
	update public.tackle_owned set quantity = greatest(0, quantity - amount) where profile_id = player and item_id = item;
$$;

create or replace function public.grant_starter_kit(player uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
	perform public.add_tackle(player, 'bankside_basics-rod-2.75-12', 3, null);
	perform public.add_tackle(player, 'bankside_basics-reel-carp_large', 3, null);
	perform public.add_tackle(player, 'bankside_basics-line-15-clear', 3000, null);
	perform public.add_tackle(player, 'bankside_basics-hook-4-micro-matt', 20, null);
	perform public.add_tackle(player, 'bankside_basics-rig-hair_lead_clip', 10, null);
	perform public.add_tackle(player, 'bankside_basics-lead', 20, null);
	perform public.add_tackle(player, 'bankside_basics-tubing-brown', 10, null);
	perform public.add_tackle(player, 'meadowmill-bait-fishmeal_boilie', 300, null);
end;
$$;

do $$
declare player record;
begin
	for player in select id from public.profiles loop perform public.grant_starter_kit(player.id); end loop;
end;
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
	first_generation constant integer := 1;
	fisherman_name text := coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1));
begin
	insert into public.profiles (id, display_name, avatar_url) values (new.id, fisherman_name, new.raw_user_meta_data ->> 'avatar_url');
	perform public.begin_fisherman(new.id, fisherman_name, first_generation);
	perform public.grant_starter_kit(new.id);
	return new;
end;
$$;

update public.profiles set saved_rods = '[]'::jsonb;

revoke execute on function public.add_tackle(uuid, text, numeric, timestamptz), public.buy_tackle(uuid, text, numeric, numeric, timestamptz), public.use_tackle(uuid, text, numeric), public.grant_starter_kit(uuid) from public, anon, authenticated;
grant execute on function public.add_tackle(uuid, text, numeric, timestamptz), public.buy_tackle(uuid, text, numeric, numeric, timestamptz), public.use_tackle(uuid, text, numeric), public.grant_starter_kit(uuid) to service_role;

alter table public.lake_visits add column tackle_losses integer not null default 0;
