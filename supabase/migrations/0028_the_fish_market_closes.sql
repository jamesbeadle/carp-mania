do $closing$
declare
	open_one record;
begin
	for open_one in select id, seller_id, carp_id from public.listings where status = 'open' loop
		perform public.refund_leading_bid(open_one.id, 'refunded');
		update public.listings set status = 'cancelled', settled_at = now() where id = open_one.id;
		perform public.send_notification(open_one.seller_id, 'unsold', 'The fish market has closed',
			'Fish are no longer sold between players, so the listing is cancelled and the fish stays in your water. The dealer still buys.', '/carp/' || open_one.carp_id);
	end loop;
end
$closing$;

drop function public.list_carp_for_sale(uuid, text, numeric, numeric, numeric, integer);
drop function public.cancel_listing(uuid);
drop function public.place_bid(uuid, numeric);
drop function public.buy_now(uuid);
drop function public.close_ended_listings();
drop function public.close_listing(uuid);
drop function public.settle_listing(uuid, uuid, numeric, numeric);
drop function public.assert_auction_takes_bids(public.listings, uuid);
drop function public.extend_if_sniped(uuid);
drop function public.next_bid_for(uuid);
drop function public.assert_listing_terms_are_sound(text, numeric, numeric, numeric, integer);
drop function public.listing_end_for(text, integer);

do $schedules$
begin
	if not exists (select 1 from pg_extension where extname = 'pg_cron') then return; end if;
	perform cron.unschedule('close-ended-listings');
end
$schedules$;
