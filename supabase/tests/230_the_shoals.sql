select test.sign_up(230);
select test.sign_up(231);
select test.give_lake(test.player(230), 'Shoal Water', 'uk_ireland', 51.5, -0.5, 5) as water \gset

set role service_role;
select public.buy_farm_shoal(
	test.player(230), 'meadow-fisheries-2-stockies',
	jsonb_build_object('size_band', 'singles', 'count', 50, 'average_weight_lb', 5, 'weight_spread_lb', 1, 'age_years', 2, 'condition', 80),
	5000, 250, now() + interval '1 hour', null, 120
) as shoal \gset
reset role;
select test.assert_that((select count = 50 and size_band = 'singles' and origin = 'farm' and farm_pack_id = 'meadow-fisheries-2-stockies' from public.carp_shoals where id = :'shoal'), 'a pack of small fish arrives as one shoal row');
select test.assert_that(test.money_of(test.player(230)) = 100000 - 5000 - 250, 'the shoal costs the fish and the transport');
select test.assert_that(public.pack_sold_count('meadow-fisheries-2-stockies') = 50, 'the pack counts the whole shoal as sold');
select test.assert_that((select count(*) from public.carp_transfers where farm_pack_id = 'meadow-fisheries-2-stockies') = 1, 'one transfer row for the shoal');

set role service_role;
select test.assert_refused(
	$$select public.buy_farm_shoal(test.player(230), 'meadow-fisheries-1-doubles', jsonb_build_object('size_band', 'doubles', 'count', 300, 'average_weight_lb', 10, 'weight_spread_lb', 2, 'age_years', 4, 'condition', 85), 30000, 250, now(), null, 120)$$,
	'over 500 lb an acre'
);
reset role;
update public.carp_shoals set transit_until = null where id = :'shoal';

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(231)::text, false);
select public.pay_day_ticket(:'water') as visit \gset
select test.assert_refused(
	format('select public.record_shoal_catch(%L, %L, %L, %L, %L, 5.25, %L, %L, %L, 6, 1, 1, 1, 1, %L, %L, %L)', test.player(231), :'visit', :'shoal', 'Newly Named', 'common', 'The Peg', 'hair rig', 'boilie', 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-shelf_life_boilie'),
	'permission denied'
);
set role service_role;
select public.record_shoal_catch(test.player(231), :'visit', :'shoal', 'Newly Named', 'common', 5.25, 'The Peg', 'hair rig', 'boilie', 6, 1, 0.5, 3, 1, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-shelf_life_boilie') as named \gset
reset role;
select test.assert_that((select name = 'Newly Named' and weight_lb = 5.25 and is_catalogued and times_caught = 1 and age_years = 2 and origin = 'farm' from public.carp where id = :'named'), 'a shoal fish gets its name, a row and a catch the first time it is landed');
select test.assert_that((select count = 49 from public.carp_shoals where id = :'shoal'), 'the shoal is one fish lighter');
select test.assert_that((select count(*) from public.catches where carp_id = :'named' and angler_id = test.player(231)) = 1, 'the catch is in the book');
select test.assert_that(public.next_carp_name_index(:'water') = 1, 'the next name follows the named fish');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(231)::text, false);
select test.assert_refused(format('select public.sell_shoal_fish(%L, 10)', :'shoal'), 'not in your water');
select set_config('request.jwt.claim.sub', test.player(230)::text, false);
select test.assert_refused(format('select public.sell_shoal_fish(%L, 60)', :'shoal'), 'has 49 fish');
select public.sell_shoal_fish(:'shoal', 9) as paid \gset
reset role;
select test.assert_that(:paid = round(public.guide_price_of(5, 'common', 80, 0) * 0.45 * 9), 'the dealer buys from a shoal by count at the bulk share');
select test.assert_that((select count = 40 from public.carp_shoals where id = :'shoal'), 'nine fewer in the shoal');
set role authenticated;
select set_config('request.jwt.claim.sub', test.player(230)::text, false);
select public.sell_shoal_fish(:'shoal', 40);
reset role;
select test.assert_that((select count(*) from public.carp_shoals where id = :'shoal') = 0, 'an emptied shoal is gone');
