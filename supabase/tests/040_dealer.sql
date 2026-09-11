select test.sign_up(40);
select test.sign_up(41);
select test.give_lake(test.player(40), 'Mersey Pit', 'uk_ireland', 53.4, -2.9, 5);
select test.give_carp(test.lake_of(test.player(40)), 'Prime', 'mirror', 25, 90, 0) as prime \gset
select test.give_carp(test.lake_of(test.player(40)), 'Poorly', 'common', 15, 20, 0) as poorly \gset
select test.give_carp(test.lake_of(test.player(40)), 'Unseen', 'common', 15, 80, 0) as unseen \gset
select test.give_carp(test.lake_of(test.player(40)), 'Travelling', 'common', 15, 80, 0) as travelling \gset
select test.give_carp(test.lake_of(test.player(40)), 'Second', 'common', 10, 100, 0) as second \gset
select test.give_carp(test.lake_of(test.player(40)), 'Third', 'common', 10, 100, 0) as third \gset
select test.give_carp(test.lake_of(test.player(40)), 'Fourth', 'common', 10, 100, 0) as fourth \gset
update public.carp set is_catalogued = false where id = :'unseen';
update public.carp set transit_until = now() + interval '1 hour' where id = :'travelling';

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(41)::text, false);
select test.assert_refused(format('select public.sell_to_dealer(%L)', :'prime'), 'not in your water');

select set_config('request.jwt.claim.sub', test.player(40)::text, false);
select test.assert_that(public.guide_price_of(25, 'mirror', 90, 0) = 2016, 'a 25 lb mirror at 90 is worth £2,016');
select public.sell_to_dealer(:'prime') as offer \gset
select test.assert_that(:offer = 1109, 'the dealer pays 55% of guide, rounded');
select test.assert_that(test.money_of(test.player(40)) = 101109, 'the money lands at once');
select test.assert_that((select count(*) from public.carp where id = :'prime') = 0, 'the fish is gone');
select test.assert_that(
	(select count(*) from public.carp_transfers where carp_name = 'Prime' and carp_id is null and kind = 'dealer_purchase'
		and from_lake_id = test.lake_of(test.player(40)) and to_lake_id is null and price = 1109) = 1,
	'the transfer keeps the name and the price'
);

select test.assert_refused(format('select public.sell_to_dealer(%L)', :'poorly'), 'under 30 condition');
select test.assert_refused(format('select public.sell_to_dealer(%L)', :'unseen'), 'catalogued');
select test.assert_refused(format('select public.sell_to_dealer(%L)', :'travelling'), 'in transit');
select test.assert_refused(format('select public.sell_to_dealer(%L)', :'prime'), 'not in your water');

select public.sell_to_dealer(:'second');
select public.sell_to_dealer(:'third');
select test.assert_refused(format('select public.sell_to_dealer(%L)', :'fourth'), 'taken 3 fish from your water today');
reset role;
select test.assert_that((select count(*) from public.carp where id = :'fourth') = 1, 'the fourth fish stays');
select test.assert_that(test.money_of(test.player(40)) = 101109 + 165 + 165, 'three sales a day');
