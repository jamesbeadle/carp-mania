create or replace function public.next_bid_for(listing uuid) returns numeric
language sql stable security definer set search_path = public as $$
	select coalesce(
		(
			select ceil(greatest(current_bid.amount * 1.02, current_bid.amount + 10) / 10) * 10
			from public.bids as current_bid
			where current_bid.listing_id = listing and current_bid.status = 'leading'
		),
		(select ceil(starting_price / 10) * 10 from public.listings where id = listing)
	);
$$;

create or replace function public.refund_leading_bid(listing uuid, new_status text) returns void
language plpgsql security definer set search_path = public as $$
declare
	previous public.bids;
	fish_name text;
begin
	select * into previous from public.bids where listing_id = listing and status = 'leading' for update;
	if previous.id is null then return; end if;
	perform public.credit_money(previous.bidder_id, previous.amount + previous.transport_cost);
	update public.bids set status = new_status where id = previous.id;
	if new_status <> 'outbid' then return; end if;
	select fish.name into fish_name from public.listings as sale join public.carp as fish on fish.id = sale.carp_id where sale.id = listing;
	perform public.send_notification(previous.bidder_id, 'outbid', 'You have been outbid on ' || fish_name,
		'Your ' || public.pounds_sterling(previous.amount) || ' and the transport are back in your account.', '/market/' || listing);
end;
$$;

create or replace function public.assert_auction_takes_bids(the_listing public.listings, bidder uuid) returns void
language plpgsql stable as $$
begin
	if the_listing.id is null then raise exception 'That listing does not exist'; end if;
	if the_listing.status <> 'open' then raise exception 'That auction has closed'; end if;
	if the_listing.kind <> 'auction' then raise exception 'That fish is buy-now only'; end if;
	if the_listing.ends_at <= now() then raise exception 'That auction has ended'; end if;
	if the_listing.seller_id = bidder then raise exception 'You cannot bid on your own fish'; end if;
end;
$$;

create or replace function public.extend_if_sniped(listing uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
	sniping_window constant interval := interval '2 minutes';
	extension constant interval := interval '2 minutes';
begin
	update public.listings set ends_at = least(latest_ends_at, ends_at + extension)
	where id = listing and ends_at - now() < sniping_window;
end;
$$;

create or replace function public.place_bid(listing uuid, amount numeric) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	the_listing public.listings;
	buyer_lake public.lakes;
	lowest_bid numeric;
	transport numeric;
	new_bid uuid;
begin
	select * into the_listing from public.listings where id = listing for update;
	perform public.assert_auction_takes_bids(the_listing, auth.uid());
	if exists (select 1 from public.bids where listing_id = listing and status = 'leading' and bidder_id = auth.uid()) then
		raise exception 'You are already the leading bidder';
	end if;
	buyer_lake := public.pinned_lake_of(auth.uid());
	lowest_bid := public.next_bid_for(listing);
	if coalesce(amount, 0) < lowest_bid then raise exception 'The next bid is at least %', public.pounds_sterling(lowest_bid); end if;
	transport := public.transport_cost_between(the_listing.lake_id, buyer_lake.id);
	perform public.debit_money(auth.uid(), amount + transport, 'That bid with transport to your water');
	perform public.refund_leading_bid(listing, 'outbid');
	insert into public.bids (listing_id, bidder_id, amount, transport_cost) values (listing, auth.uid(), amount, transport) returning id into new_bid;
	perform public.extend_if_sniped(listing);
	return new_bid;
end;
$$;

create or replace function public.refund_bids_of_deleted_listing() returns trigger
language plpgsql security definer set search_path = public as $$
begin
	if old.status = 'open' then perform public.refund_leading_bid(old.id, 'refunded'); end if;
	return old;
end;
$$;
create trigger refund_bids_before_a_listing_is_deleted
	before delete on public.listings
	for each row execute procedure public.refund_bids_of_deleted_listing();

revoke execute on function public.refund_leading_bid(uuid, text), public.extend_if_sniped(uuid) from public, anon, authenticated;
