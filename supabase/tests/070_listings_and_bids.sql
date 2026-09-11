select test.sign_up(70);
select test.sign_up(71);
select test.sign_up(72);
select test.give_lake(test.player(70), 'London Pit', 'uk_ireland', 51.5074, -0.1278, 5);
select test.give_lake(test.player(71), 'Paris Lac', 'france', 48.8566, 2.3522, 5);
select test.give_lake(test.player(72), 'Berlin See', 'benelux_germany', 52.52, 13.405, 5);
select test.give_carp(test.lake_of(test.player(70)), 'Prize', 'mirror', 25, 90, 0) as prize \gset
select test.give_carp(test.lake_of(test.player(70)), 'Poorly', 'common', 15, 30, 0) as poorly \gset

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(71)::text, false);
select test.assert_refused(format('select public.list_carp_for_sale(%L, %L, 1000, null, null, 24)', :'prize', 'auction'), 'not in your water');
select set_config('request.jwt.claim.sub', test.player(70)::text, false);
select test.assert_refused(format('select public.list_carp_for_sale(%L, %L, 1000, null, null, 13)', :'prize', 'auction'), '12, 24, 48 or 72 hours');
select test.assert_refused(format('select public.list_carp_for_sale(%L, %L, 5, null, null, 24)', :'prize', 'auction'), 'at least £10');
select test.assert_refused(format('select public.list_carp_for_sale(%L, %L, 1000, 900, null, 24)', :'prize', 'auction'), 'reserve cannot be below');
select test.assert_refused(format('select public.list_carp_for_sale(%L, %L, 1000, null, 900, 24)', :'prize', 'auction'), 'buy-now price cannot be below');
select test.assert_refused(format('select public.list_carp_for_sale(%L, %L, 1000, null, null, null)', :'prize', 'buy_now'), 'needs a buy-now price');
select test.assert_refused(format('select public.list_carp_for_sale(%L, %L, 1000, null, null, 24)', :'prize', 'raffle'), 'either an auction or a buy-now');
select test.assert_refused(format('select public.list_carp_for_sale(%L, %L, 1000, null, null, 24)', :'poorly', 'auction'), 'under 40 condition');
select public.list_carp_for_sale(:'prize', 'auction', 1000, null, null, 24) as listing \gset
select test.assert_that(test.money_of(test.player(70)) = 99975, 'the listing fee is £25 on a £1,000 start');
select test.assert_that(
	(select status = 'open' and abs(extract(epoch from (ends_at - (now() + interval '24 hours')))) < 5 and latest_ends_at = ends_at + interval '30 minutes'
		from public.listings where id = :'listing'),
	'a 24-hour auction with half an hour of grace'
);
select test.assert_refused(format('select public.list_carp_for_sale(%L, %L, 1000, null, null, 24)', :'prize', 'auction'), 'already up for sale');
select test.assert_refused(format('select public.place_bid(%L, 1000)', :'listing'), 'your own fish');

select set_config('request.jwt.claim.sub', test.player(71)::text, false);
select test.assert_that(public.next_bid_for(:'listing') = 1000, 'the first bid is the starting price');
select test.assert_refused(format('select public.place_bid(%L, 990)', :'listing'), 'at least £1,000');
select public.place_bid(:'listing', 1000) as first_bid \gset
select test.assert_that(test.money_of(test.player(71)) = 100000 - 1000 - 370, 'the bid and the transport to Paris are held');
select test.assert_that((select status = 'leading' and transport_cost = 370 from public.bids where id = :'first_bid'), 'the bid leads with its transport');
select test.assert_that(public.next_bid_for(:'listing') = 1020, 'the next bid is £10 up, rounded to £10');

select set_config('request.jwt.claim.sub', test.player(72)::text, false);
select test.assert_refused(format('select public.place_bid(%L, 1010)', :'listing'), 'at least £1,020');
select public.place_bid(:'listing', 1020) as second_bid \gset
select test.assert_that(test.money_of(test.player(72)) = 100000 - 1020 - 576, 'Berlin pays more transport');
select test.assert_that(test.money_of(test.player(71)) = 100000, 'the outbid player gets bid and transport back exactly');
select test.assert_that((select status from public.bids where id = :'first_bid') = 'outbid', 'the first bid is outbid');

reset role;
update public.listings set ends_at = now() + interval '1 minute' where id = :'listing';
select ends_at as sniped_ends_at from public.listings where id = :'listing' \gset
set role authenticated;
select set_config('request.jwt.claim.sub', test.player(71)::text, false);
select public.place_bid(:'listing', 1050) as third_bid \gset
select test.assert_that((select ends_at = :'sniped_ends_at'::timestamptz + interval '2 minutes' from public.listings where id = :'listing'), 'a late bid adds two minutes');
select test.assert_that(test.money_of(test.player(72)) = 100000, 'Berlin is refunded in full');
reset role;
update public.listings set ends_at = now() + interval '1 minute', latest_ends_at = now() + interval '2 minutes' where id = :'listing';
set role authenticated;
select set_config('request.jwt.claim.sub', test.player(72)::text, false);
select public.place_bid(:'listing', 1080) as fourth_bid \gset
select test.assert_that((select ends_at = latest_ends_at from public.listings where id = :'listing'), 'never past thirty minutes of extra time');

reset role;
update public.listings set ends_at = now() - interval '1 second' where id = :'listing';
set role authenticated;
select set_config('request.jwt.claim.sub', test.player(71)::text, false);
select test.assert_refused(format('select public.place_bid(%L, 1200)', :'listing'), 'auction has ended');
set role service_role;
select public.close_ended_listings() as closed \gset
select test.assert_that(:closed = 1, 'one auction closed');
select test.assert_that(public.close_ended_listings() = 0, 'and nothing is settled twice');
reset role;

select test.assert_that(test.money_of(test.player(70)) = 99975 + 1080 - 86, 'the seller receives 92%');
select test.assert_that(test.money_of(test.player(71)) = 100000 and test.money_of(test.player(72)) = 100000 - 1080 - 576, 'the winner paid, the loser did not');
select test.assert_that(
	test.money_of(test.player(70)) + test.money_of(test.player(71)) + test.money_of(test.player(72)) = 300000 - 25 - 86 - 576,
	'the fee, the commission and the transport have left the game'
);
select test.assert_that(
	(select lake_id = test.lake_of(test.player(72)) and condition = 86 and abs(extract(epoch from (transit_until - (now() + interval '2 hours')))) < 5
		and quarantine_until = transit_until + interval '5 hours' from public.carp where id = :'prize'),
	'the fish is on a two-day journey to Berlin, stressed, with five days of quarantine across the border'
);
select test.assert_that(
	(select count(*) from public.carp_transfers where carp_id = :'prize' and kind = 'sale' and listing_id = :'listing' and price = 1080 and commission = 86
		and transport_cost = 576 and distance_km = 931.6 and from_lake_id = test.lake_of(test.player(70)) and to_lake_id = test.lake_of(test.player(72))
		and arrives_at = (select transit_until from public.carp where id = :'prize') and quarantine_until = (select quarantine_until from public.carp where id = :'prize')) = 1,
	'the transfer records the whole journey'
);
select test.assert_that((select status = 'sold' and sold_price = 1080 and buyer_id = test.player(72) and settled_at is not null from public.listings where id = :'listing'), 'sold');
select test.assert_that((select status from public.bids where id = :'fourth_bid') = 'won' and (select status from public.bids where id = :'third_bid') = 'outbid', 'bids settle');
select test.assert_that((select count(*) from public.bids where listing_id = :'listing' and status = 'outbid') = 3, 'three bids were outbid');
select test.assert_that((select count(*) from public.notifications where profile_id = test.player(70) and kind = 'sold') = 1, 'the seller hears');
select test.assert_that((select count(*) from public.notifications where profile_id = test.player(72) and kind = 'won') = 1, 'the buyer hears');
select test.assert_that((select count(*) from public.notifications where profile_id = test.player(72) and kind = 'outbid') = 1, 'Berlin was outbid once');
select test.assert_that((select count(*) from public.notifications where profile_id = test.player(71) and kind = 'outbid') = 2, 'Paris was outbid twice');
select test.assert_that(
	(select count(*) from public.world_events where kind = 'sale' and lake_id = test.lake_of(test.player(70)) and other_lake_id = test.lake_of(test.player(72))
		and payload ->> 'fishName' = 'Prize' and (payload ->> 'price')::numeric = 1080) = 1,
	'the world sees the sale fly from London to Berlin'
);
