create or replace function public.close_listing(listing uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
	sale public.listings;
	winner public.bids;
	fish_name text;
	why text;
begin
	select * into sale from public.listings where id = listing for update;
	select * into winner from public.bids where listing_id = listing and status = 'leading';
	if sale.kind = 'auction' and winner.id is not null and winner.amount >= coalesce(sale.reserve_price, 0)
		and exists (select 1 from public.lakes where owner_id = winner.bidder_id and latitude is not null) then
		perform public.settle_listing(listing, winner.bidder_id, winner.amount, winner.transport_cost);
		return;
	end if;
	perform public.refund_leading_bid(listing, 'refunded');
	update public.listings set status = 'unsold', settled_at = now() where id = listing;
	select name into fish_name from public.carp where id = sale.carp_id;
	why := case when winner.id is null then 'Nobody bought it' else 'The bidding did not reach your reserve' end;
	perform public.send_notification(sale.seller_id, 'unsold', fish_name || ' did not sell',
		why || '; the fish stays in your water and the listing fee is spent.', '/carp/' || sale.carp_id);
end;
$$;

create or replace function public.close_ended_listings() returns integer
language plpgsql security definer set search_path = public as $$
declare
	ended record;
	closed integer := 0;
begin
	for ended in
		select id from public.listings where status = 'open' and ends_at <= now() order by ends_at for update skip locked
	loop
		perform public.close_listing(ended.id);
		closed := closed + 1;
	end loop;
	return closed;
end;
$$;

revoke execute on function public.close_listing(uuid), public.close_ended_listings() from public, anon, authenticated;
grant execute on function public.close_ended_listings() to service_role;

create or replace function public.sell_to_dealer(fish uuid) returns numeric
language plpgsql security definer set search_path = public as $$
declare
	dealer_share constant numeric := 0.55;
	the_carp public.carp;
	offer numeric;
begin
	select * into the_carp from public.carp where id = fish and public.is_lake_owner(lake_id) for update;
	if the_carp.id is null then raise exception 'That fish is not in your water'; end if;
	if exists (select 1 from public.listings where carp_id = fish and status = 'open') then
		raise exception 'That fish is up for sale; cancel the listing before the dealer can take it';
	end if;
	perform public.assert_dealer_will_buy(the_carp);
	offer := round(public.guide_price_of(the_carp.weight_lb, the_carp.strain, the_carp.condition, the_carp.fame) * dealer_share);
	insert into public.carp_transfers (carp_id, carp_name, kind, from_lake_id, price)
	values (the_carp.id, the_carp.name, 'dealer_purchase', the_carp.lake_id, offer);
	delete from public.carp where id = fish;
	perform public.credit_money(auth.uid(), offer);
	return offer;
end;
$$;
