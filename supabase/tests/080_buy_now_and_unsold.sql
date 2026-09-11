select test.sign_up(80);
select test.sign_up(81);
select test.give_lake(test.player(80), 'Thames Pit', 'uk_ireland', 51.5074, -0.1278, 5);
select test.give_lake(test.player(81), 'Seine Lac', 'france', 48.8566, 2.3522, 5);
select test.give_carp(test.lake_of(test.player(80)), 'Quick', 'common', 12, 80, 0) as quick \gset
select test.give_carp(test.lake_of(test.player(80)), 'Lonely', 'common', 12, 80, 0) as lonely \gset
select test.give_carp(test.lake_of(test.player(80)), 'Reserved', 'mirror', 20, 80, 0) as reserved \gset
select test.give_carp(test.lake_of(test.player(80)), 'Cancelled', 'common', 12, 80, 0) as cancelled \gset
select test.give_carp(test.lake_of(test.player(80)), 'Dear', 'common', 12, 80, 0) as dear \gset

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(80)::text, false);
select public.list_carp_for_sale(:'quick', 'buy_now', 500, null, 500, null) as quick_listing \gset
select test.assert_that((select abs(extract(epoch from (ends_at - (now() + interval '14 days')))) < 5 from public.listings where id = :'quick_listing'), 'a buy-now lasts fourteen days');
select test.assert_refused(format('select public.buy_now(%L)', :'quick_listing'), 'your own fish');
select set_config('request.jwt.claim.sub', test.player(81)::text, false);
select test.assert_refused(format('select public.place_bid(%L, 500)', :'quick_listing'), 'buy-now only');
select public.buy_now(:'quick_listing') as transfer \gset
select test.assert_that(
	(select kind = 'sale' and price = 500 and commission = 40 and transport_cost = 370 and distance_km = 343.6 and carp_id = :'quick' from public.carp_transfers where id = :'transfer'),
	'buy-now settles at the buy-now price'
);
select test.assert_that(test.money_of(test.player(81)) = 100000 - 500 - 370, 'the buyer pays the landed cost');
select test.assert_that(test.money_of(test.player(80)) = 100000 - 25 + 460, 'the seller gets 92% less the fee');
select test.assert_that((select status = 'sold' and buyer_id = test.player(81) and sold_price = 500 from public.listings where id = :'quick_listing'), 'sold at once');
select test.assert_that(
	(select lake_id = test.lake_of(test.player(81)) and condition = 79 and quarantine_until = transit_until + interval '5 hours' from public.carp where id = :'quick'),
	'the fish is on its way to France'
);
select test.assert_refused(format('select public.buy_now(%L)', :'quick_listing'), 'already gone');
reset role;
select test.assert_that((select count(*) from public.notifications where profile_id = test.player(81) and kind = 'won') = 1, 'the buyer is told');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(80)::text, false);
select public.list_carp_for_sale(:'lonely', 'auction', 100, null, null, 12) as lonely_listing \gset
select set_config('request.jwt.claim.sub', test.player(81)::text, false);
select test.assert_refused(format('select public.buy_now(%L)', :'lonely_listing'), 'no buy-now price');
reset role;
update public.listings set ends_at = now() - interval '1 second' where id = :'lonely_listing';
set role service_role;
select test.assert_that(public.close_ended_listings() = 1, 'the lonely auction closes');
reset role;
select test.assert_that((select status = 'unsold' and settled_at is not null and buyer_id is null from public.listings where id = :'lonely_listing'), 'unsold');
select test.assert_that((select lake_id = test.lake_of(test.player(80)) from public.carp where id = :'lonely'), 'the fish stays put');
select test.assert_that((select count(*) from public.notifications where profile_id = test.player(80) and kind = 'unsold' and body like 'Nobody bought it%') = 1, 'the seller is told nobody bid');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(80)::text, false);
select public.list_carp_for_sale(:'reserved', 'auction', 100, 5000, null, 12) as reserved_listing \gset
select set_config('request.jwt.claim.sub', test.player(81)::text, false);
select public.place_bid(:'reserved_listing', 100) as low_bid \gset
select test.assert_that(test.money_of(test.player(81)) = 99130 - 100 - 370, 'the bid is held');
select set_config('request.jwt.claim.sub', test.player(80)::text, false);
select test.assert_refused(format('select public.cancel_listing(%L)', :'reserved_listing'), 'once someone has bid');
reset role;
update public.listings set ends_at = now() - interval '1 second' where id = :'reserved_listing';
set role service_role;
select test.assert_that(public.close_ended_listings() = 1, 'the reserved auction closes');
reset role;
select test.assert_that((select status from public.listings where id = :'reserved_listing') = 'unsold', 'the reserve was not met');
select test.assert_that((select status from public.bids where id = :'low_bid') = 'refunded', 'the bid is refunded');
select test.assert_that(test.money_of(test.player(81)) = 99130, 'to the penny');
select test.assert_that((select count(*) from public.notifications where profile_id = test.player(80) and kind = 'unsold' and body like 'The bidding did not reach your reserve%') = 1, 'the seller is told why');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(80)::text, false);
select public.list_carp_for_sale(:'cancelled', 'auction', 100, null, null, 12) as cancelled_listing \gset
select set_config('request.jwt.claim.sub', test.player(81)::text, false);
select test.assert_refused(format('select public.cancel_listing(%L)', :'cancelled_listing'), 'not yours');
select set_config('request.jwt.claim.sub', test.player(80)::text, false);
select public.cancel_listing(:'cancelled_listing');
select test.assert_that((select status from public.listings where id = :'cancelled_listing') = 'cancelled', 'cancelled with no bids');
select test.assert_refused(format('select public.cancel_listing(%L)', :'cancelled_listing'), 'already closed');
select public.list_carp_for_sale(:'cancelled', 'auction', 100, null, null, 12) as relisted \gset
select test.assert_refused(format('select public.sell_to_dealer(%L)', :'cancelled'), 'up for sale');
select public.cancel_listing(:'relisted');
select test.assert_that(test.money_of(test.player(80)) = 100000 - 25 + 460 - 25 - 25 - 25 - 25, 'every listing fee is spent, cancelled or not');

select public.list_carp_for_sale(:'dear', 'buy_now', 300, null, 300, null) as dear_listing \gset
reset role;
update public.profiles set money = 100 where id = test.player(81);
set role authenticated;
select set_config('request.jwt.claim.sub', test.player(81)::text, false);
select test.assert_refused(format('select public.buy_now(%L)', :'dear_listing'), 'costs £670 and you have £100');
reset role;
select test.assert_that((select status from public.listings where id = :'dear_listing') = 'open' and test.money_of(test.player(81)) = 100, 'nothing moves when the money is short');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(80)::text, false);
select test.assert_that((select listing_count from public.world_pins where id = test.lake_of(test.player(80))) = 1, 'the globe counts fish for sale');
select public.list_carp_for_sale(:'lonely', 'auction', 100, null, null, 12) as pike_listing \gset
reset role;
update public.profiles set money = 100000 where id = test.player(81);
set role authenticated;
select set_config('request.jwt.claim.sub', test.player(81)::text, false);
select public.place_bid(:'pike_listing', 100);
reset role;
delete from public.carp where id = :'lonely';
select test.assert_that(test.money_of(test.player(81)) = 100000 and (select count(*) from public.listings where id = :'pike_listing') = 0, 'a listed fish taken by a pike refunds its bidder');
