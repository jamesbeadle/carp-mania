create or replace function public.ship_carp(sale public.listings, destination public.lakes, price numeric, commission numeric, transport numeric) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	quarantine_time constant interval := interval '5 hours';
	km numeric := public.distance_between_lakes(sale.lake_id, destination.id);
	arrives timestamptz := now() + public.transit_time_for(km);
	quarantine timestamptz;
	fish_name text;
	transfer uuid;
begin
	if destination.region is distinct from (select region from public.lakes where id = sale.lake_id) then
		quarantine := arrives + quarantine_time;
	end if;
	update public.carp
	set lake_id = destination.id, transit_until = arrives, quarantine_until = quarantine, condition = public.condition_after_transport(condition, km)
	where id = sale.carp_id returning name into fish_name;
	insert into public.carp_transfers (carp_id, carp_name, kind, listing_id, from_lake_id, to_lake_id, price, commission, transport_cost, distance_km, departed_at, arrives_at, quarantine_until)
	values (sale.carp_id, fish_name, 'sale', sale.id, sale.lake_id, destination.id, price, commission, transport, km, now(), arrives, quarantine)
	returning id into transfer;
	return transfer;
end;
$$;

create or replace function public.settle_listing(listing uuid, buyer uuid, price numeric, transport numeric) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	commission_share constant numeric := 0.08;
	sale public.listings;
	buyer_lake public.lakes;
	commission numeric := round(price * commission_share);
	fish_name text;
	transfer uuid;
begin
	select * into sale from public.listings where id = listing for update;
	select * into buyer_lake from public.lakes where owner_id = buyer;
	perform public.credit_money(sale.seller_id, price - commission);
	transfer := public.ship_carp(sale, buyer_lake, price, commission, transport);
	update public.listings set status = 'sold', sold_price = price, buyer_id = buyer, settled_at = now() where id = listing;
	update public.bids set status = 'won' where listing_id = listing and status = 'leading';
	select carp_name into fish_name from public.carp_transfers where id = transfer;
	perform public.send_notification(sale.seller_id, 'sold', fish_name || ' has sold for ' || public.pounds_sterling(price),
		public.pounds_sterling(price - commission) || ' after commission is in your account; the fish is on its way.', '/carp/' || sale.carp_id);
	perform public.send_notification(buyer, 'won', fish_name || ' is yours', fish_name || ' is on its way to your water.', '/carp/' || sale.carp_id);
	insert into public.world_events (kind, lake_id, other_lake_id, payload)
	values ('sale', sale.lake_id, buyer_lake.id, jsonb_build_object('fishName', fish_name, 'price', price));
	return transfer;
end;
$$;

create or replace function public.buy_now(listing uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	the_listing public.listings;
	buyer_lake public.lakes;
	transport numeric;
begin
	select * into the_listing from public.listings where id = listing for update;
	if the_listing.id is null then raise exception 'That listing does not exist'; end if;
	if the_listing.status <> 'open' then raise exception 'That fish has already gone'; end if;
	if the_listing.buy_now_price is null then raise exception 'That fish has no buy-now price; bid for it instead'; end if;
	if the_listing.ends_at <= now() then raise exception 'That listing has ended'; end if;
	if the_listing.seller_id = auth.uid() then raise exception 'You cannot buy your own fish'; end if;
	buyer_lake := public.pinned_lake_of(auth.uid());
	transport := public.transport_cost_between(the_listing.lake_id, buyer_lake.id);
	perform public.debit_money(auth.uid(), the_listing.buy_now_price + transport, 'Buying that fish with transport to your water');
	perform public.refund_leading_bid(listing, 'outbid');
	return public.settle_listing(listing, auth.uid(), the_listing.buy_now_price, transport);
end;
$$;

revoke execute on function public.ship_carp(public.listings, public.lakes, numeric, numeric, numeric),
	public.settle_listing(uuid, uuid, numeric, numeric) from public, anon, authenticated;
