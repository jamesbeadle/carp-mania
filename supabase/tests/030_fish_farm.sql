select test.sign_up(30);
select test.sign_up(31);
select test.sign_up(32);
select test.sign_up(33);
select test.give_lake(test.player(30), 'Madrid Pit', 'iberia', 40.4, -3.7, 2);
select test.give_lake(test.player(31), 'Roman Lake', 'italy_balkans', 41.9, 12.5, 2);
select test.give_lake(test.player(32), 'Tiny Pond', 'iberia', 41.4, 2.2, 0.2);

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(30)::text, false);
select public.buy_from_fish_farm(jsonb_build_array(
	test.farm_fish('stockies', 'Little One', 5),
	test.farm_fish('twenties', 'Big One', 24),
	jsonb_build_object('band', 'doubles', 'name', 'Scaly', 'strain', 'fully_scaled', 'weight_lb', 10, 'age_years', 5, 'condition', 90)
)) as delivered \gset
select test.assert_that(:delivered = 3, 'the farm delivers every fish on the order');
select test.assert_that(test.money_of(test.player(30)) = 100000 - 150 - 1500 - 300 - 250, 'the order costs the band prices plus one delivery');
select test.assert_that(
	(select count(*) from public.carp where lake_id = test.lake_of(test.player(30)) and origin = 'farm' and is_catalogued and fame = 0
		and origin_lake_id is null and quarantine_until is null and abs(extract(epoch from (transit_until - (now() + interval '1 hour')))) < 5) = 3,
	'farm fish arrive in an hour, catalogued, with no fame'
);
select test.assert_that((select strain from public.carp where name = 'Scaly') = 'fully_scaled', 'a fully scaled carp is a strain');
select test.assert_that(
	(select count(*) from public.carp_transfers where to_lake_id = test.lake_of(test.player(30)) and kind = 'farm_delivery' and distance_km = 0) = 3,
	'one transfer per fish'
);
select test.assert_that((select sum(transport_cost) from public.carp_transfers where to_lake_id = test.lake_of(test.player(30))) = 250, 'delivery is charged once');
select test.assert_that(
	(select price from public.carp_transfers where carp_name = 'Big One') = 1500 and (select farm_band from public.carp_transfers where carp_name = 'Big One') = 'twenties',
	'the transfer records the band and its price'
);
select test.assert_that(public.farm_supply_left('iberia', 'twenties') = 9, 'the region has one twenty fewer this week');
select test.assert_that(public.farm_supply_left('iberia', 'stockies') = 199, 'and one stockie fewer');

select test.assert_refused(
	$$select public.buy_from_fish_farm((select jsonb_agg(test.farm_fish('twenties', 'Twenty ' || n, 22)) from generate_series(1, 10) as n))$$,
	'only 9 twenties left'
);
select test.assert_refused($$select public.buy_from_fish_farm(jsonb_build_array(test.farm_fish('stockies', 'Fat Stockie', 9)))$$, 'weighs 4 to 6 lb');
select test.assert_refused($$select public.buy_from_fish_farm(jsonb_build_array(test.farm_fish('thirties', 'Dream', 30)))$$, 'no "thirties" band');
select test.assert_refused(
	$$select public.buy_from_fish_farm(jsonb_build_array(jsonb_build_object('band', 'doubles', 'name', 'Mint', 'strain', 'common', 'weight_lb', 10, 'age_years', 5, 'condition', 95)))$$,
	'condition 80 to 90'
);
select test.assert_refused(
	$$select public.buy_from_fish_farm(jsonb_build_array(jsonb_build_object('band', 'doubles', 'name', 'Koi', 'strain', 'koi', 'weight_lb', 10, 'age_years', 5, 'condition', 85)))$$,
	'does not breed "koi"'
);
select test.assert_refused($$select public.buy_from_fish_farm('[]'::jsonb)$$, 'nothing on the order');

select set_config('request.jwt.claim.sub', test.player(32)::text, false);
select test.assert_refused(
	$$select public.buy_from_fish_farm((select jsonb_agg(test.farm_fish('twenties', 'Heavy ' || n, 24)) from generate_series(1, 5) as n))$$,
	'over 500 lb an acre'
);
select public.buy_from_fish_farm((select jsonb_agg(test.farm_fish('twenties', 'Heavy ' || n, 24)) from generate_series(1, 4) as n));
select test.assert_that(public.farm_supply_left('iberia', 'twenties') = 5, 'both Iberian lakes draw on the same weekly list');

select set_config('request.jwt.claim.sub', test.player(31)::text, false);
select public.buy_from_fish_farm((select jsonb_agg(test.farm_fish('twenties', 'Roman ' || n, 21)) from generate_series(1, 10) as n));
select test.assert_that(public.farm_supply_left('italy_balkans', 'twenties') = 0, 'another region has its own list');
select test.assert_refused($$select public.buy_from_fish_farm(jsonb_build_array(test.farm_fish('twenties', 'One More', 21)))$$, 'only 0 twenties left');

select set_config('request.jwt.claim.sub', test.player(33)::text, false);
select test.assert_refused($$select public.buy_from_fish_farm(jsonb_build_array(test.farm_fish('stockies', 'Homeless', 5)))$$, 'water of your own');

reset role;
update public.profiles set money = 100 where id = test.player(30);
set role authenticated;
select set_config('request.jwt.claim.sub', test.player(30)::text, false);
select test.assert_refused($$select public.buy_from_fish_farm(jsonb_build_array(test.farm_fish('stockies', 'Unaffordable', 5)))$$, 'costs £400 and you have £100');
reset role;
select test.assert_that(test.money_of(test.player(30)) = 100, 'a refused order costs nothing');
