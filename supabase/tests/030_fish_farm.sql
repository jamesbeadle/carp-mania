select test.sign_up(30);
select test.sign_up(32);
select test.sign_up(33);
select test.give_lake(test.player(30), 'Madrid Pit', 'iberia', 40.4, -3.7, 2);
select test.give_lake(test.player(32), 'Tiny Pond', 'iberia', 41.4, 2.2, 0.2);

set role service_role;
select public.buy_farm_pack(
	test.player(30), 'donau-karpfenhof-1-fifties',
	jsonb_build_array(test.farm_fish('Big One', 50), test.farm_fish('Bigger One', 52)),
	21000, 810, now() + interval '2 hours', now() + interval '7 hours', 1600
) as delivered \gset
select test.assert_that(:delivered = 2, 'the farm delivers every fish in the pack');
select test.assert_that(test.money_of(test.player(30)) = 100000 - 21000 - 810, 'the pack costs the fish price plus the transport');
select test.assert_that(
	(select count(*) from public.carp where lake_id = test.lake_of(test.player(30)) and origin = 'farm' and is_catalogued and fame = 0
		and origin_lake_id is null and abs(extract(epoch from (transit_until - (now() + interval '2 hours')))) < 5
		and abs(extract(epoch from (quarantine_until - (now() + interval '7 hours')))) < 5) = 2,
	'farm fish arrive after two days and sit five days in quarantine, catalogued, with no fame'
);
select test.assert_that(
	(select count(*) from public.carp_transfers where to_lake_id = test.lake_of(test.player(30)) and kind = 'farm_delivery' and distance_km = 1600 and farm_pack_id = 'donau-karpfenhof-1-fifties') = 2,
	'one transfer per fish, each naming the pack'
);
select test.assert_that((select sum(transport_cost) from public.carp_transfers where to_lake_id = test.lake_of(test.player(30))) = 810, 'transport is charged once');
select test.assert_that((select sum(price) from public.carp_transfers where to_lake_id = test.lake_of(test.player(30))) = 21000, 'the fish price is spread over the fish');
select test.assert_that(public.pack_sold_count('donau-karpfenhof-1-fifties') = 2, 'the pack counts what has gone from it');
select test.assert_that(public.pack_sold_count('meadow-fisheries-1-stockies') = 0, 'an untouched pack has sold nothing');

select test.assert_refused($$select public.buy_farm_pack(test.player(30), 'meadow-fisheries-1-stockies', '[]'::jsonb, 0, 250, now(), null, 0)$$, 'nothing on the order');
select test.assert_refused($$select public.buy_farm_pack(test.player(33), 'meadow-fisheries-1-stockies', jsonb_build_array(test.farm_fish('Homeless', 5)), 100, 250, now(), null, 0)$$, 'water of your own');
select test.assert_refused(
	$$select public.buy_farm_pack(test.player(32), 'etang-du-roi-1-twenties', (select jsonb_agg(test.farm_fish('Heavy ' || n, 24)) from generate_series(1, 5) as n), 5000, 250, now(), null, 0)$$,
	'over 500 lb an acre'
);
select public.buy_farm_pack(test.player(32), 'etang-du-roi-1-twenties', (select jsonb_agg(test.farm_fish('Heavy ' || n, 24)) from generate_series(1, 4) as n), 4000, 250, now(), null, 0);
select test.assert_that(public.pack_sold_count('etang-du-roi-1-twenties') = 4, 'every water draws on the same pack');
reset role;

update public.profiles set money = 100 where id = test.player(30);
set role service_role;
select test.assert_refused($$select public.buy_farm_pack(test.player(30), 'meadow-fisheries-1-stockies', jsonb_build_array(test.farm_fish('Unaffordable', 5)), 150, 250, now(), null, 0)$$, 'costs £400 and you have £100');
reset role;
select test.assert_that(test.money_of(test.player(30)) = 100, 'a refused order costs nothing');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(30)::text, false);
select test.assert_refused($$select public.buy_farm_pack(test.player(30), 'meadow-fisheries-1-stockies', jsonb_build_array(test.farm_fish('Sneaky', 5)), 0, 0, now(), null, 0)$$, 'permission denied');
reset role;
