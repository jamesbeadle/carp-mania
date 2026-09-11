create or replace function public.assert_carp_can_be_listed(the_carp public.carp) returns void
language plpgsql stable security definer set search_path = public as $$
declare
	lowest_condition constant numeric := 40;
	most_open_listings_per_lake constant integer := 20;
begin
	if not the_carp.is_catalogued then raise exception 'A fish must be catalogued before it can be sold'; end if;
	if the_carp.transit_until is not null then raise exception 'That fish is in transit'; end if;
	if the_carp.quarantine_until is not null then raise exception 'That fish is in quarantine'; end if;
	if the_carp.condition < lowest_condition then raise exception 'A fish under % condition cannot be listed', lowest_condition; end if;
	if exists (select 1 from public.listings where carp_id = the_carp.id and status = 'open') then
		raise exception 'That fish is already up for sale';
	end if;
	if (select count(*) from public.listings where lake_id = the_carp.lake_id and status = 'open') >= most_open_listings_per_lake then
		raise exception 'You already have % fish up for sale; wait for one to close', most_open_listings_per_lake;
	end if;
	if not exists (select 1 from public.lakes where id = the_carp.lake_id and latitude is not null and longitude is not null) then
		raise exception 'Pin your water on the globe before you sell fish';
	end if;
end;
$$;

create or replace function public.assert_listing_terms_are_sound(kind text, starting_price numeric, reserve_price numeric, buy_now_price numeric, duration_hours integer) returns void
language plpgsql immutable as $$
declare
	lowest_starting_price constant numeric := 10;
begin
	if coalesce(kind, '') not in ('auction', 'buy_now') then raise exception 'A listing is either an auction or a buy-now'; end if;
	if coalesce(starting_price, 0) < lowest_starting_price then
		raise exception 'The starting price must be at least %', public.pounds_sterling(lowest_starting_price);
	end if;
	if reserve_price < starting_price then raise exception 'The reserve cannot be below the starting price'; end if;
	if buy_now_price < starting_price then raise exception 'The buy-now price cannot be below the starting price'; end if;
	if kind = 'buy_now' and buy_now_price is null then raise exception 'A buy-now listing needs a buy-now price'; end if;
	if kind = 'auction' and coalesce(duration_hours, 0) not in (12, 24, 48, 72) then
		raise exception 'Auctions run for 12, 24, 48 or 72 hours';
	end if;
end;
$$;

create or replace function public.listing_end_for(kind text, duration_hours integer) returns timestamptz
language sql stable as $$
	select case kind when 'auction' then now() + duration_hours * interval '1 hour' else now() + interval '14 days' end;
$$;

create or replace function public.list_carp_for_sale(fish uuid, kind text, starting_price numeric, reserve_price numeric, buy_now_price numeric, duration_hours integer) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	fee_share constant numeric := 0.01;
	lowest_fee constant numeric := 25;
	longest_extension constant interval := interval '30 minutes';
	the_carp public.carp;
	fee numeric;
	closes_at timestamptz;
	new_listing uuid;
begin
	select * into the_carp from public.carp where id = fish and public.is_lake_owner(lake_id) for update;
	if the_carp.id is null then raise exception 'That fish is not in your water'; end if;
	perform public.assert_carp_can_be_listed(the_carp);
	perform public.assert_listing_terms_are_sound(kind, starting_price, reserve_price, buy_now_price, duration_hours);
	closes_at := public.listing_end_for(kind, duration_hours);
	fee := greatest(lowest_fee, round(starting_price * fee_share));
	perform public.debit_money(auth.uid(), fee, 'The listing fee');
	insert into public.listings (carp_id, lake_id, seller_id, kind, starting_price, reserve_price, buy_now_price, listing_fee, ends_at, latest_ends_at)
	values (fish, the_carp.lake_id, auth.uid(), kind, starting_price, reserve_price, buy_now_price, fee, closes_at, closes_at + longest_extension)
	returning id into new_listing;
	return new_listing;
end;
$$;

create or replace function public.cancel_listing(listing uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
	the_listing public.listings;
begin
	select * into the_listing from public.listings where id = listing and seller_id = auth.uid() for update;
	if the_listing.id is null then raise exception 'That listing is not yours'; end if;
	if the_listing.status <> 'open' then raise exception 'That listing has already closed'; end if;
	if exists (select 1 from public.bids where listing_id = listing and status = 'leading') then
		raise exception 'You cannot cancel once someone has bid';
	end if;
	update public.listings set status = 'cancelled', settled_at = now() where id = listing;
end;
$$;

revoke execute on function public.assert_carp_can_be_listed(public.carp) from public, anon, authenticated;
