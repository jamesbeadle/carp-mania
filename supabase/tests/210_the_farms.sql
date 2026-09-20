select test.sign_up(210);
select test.sign_up(211);
select test.give_lake(test.player(210), 'Home Water', 'uk_ireland', 51.5, -0.5, 5) as home \gset
select test.give_lake(test.player(210), 'Syndicate Water', 'uk_ireland', 52.5, -1.5, 5) as syndicate \gset
select test.give_lake(test.player(211), 'Next Door', 'uk_ireland', 51.6, -0.4, 5) as next_door \gset
select test.give_carp(:'home', 'Mover', 'mirror', 24, 90, 0) as mover \gset
select test.give_carp(:'home', 'Stayer', 'common', 14, 90, 0) as stayer \gset
select test.give_carp(:'home', 'Listed', 'common', 12, 90, 0) as listed \gset
select test.give_carp(:'next_door', 'Neighbour', 'common', 12, 90, 0) as neighbour \gset

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(210)::text, false);
select public.list_carp_for_sale(:'listed', 'buy_now', 1000, null, 1200, 24);
select public.move_to_my_water(array[:'mover', :'stayer']::uuid[], :'syndicate', 300, now() + interval '1 hour', null, 140) as moved \gset
select test.assert_that(:moved = 2, 'both fish are on the lorry');
reset role;
select test.assert_that(test.money_of(test.player(210)) = 100000 - 25 - 300, 'the transport is paid once, after the listing fee');
select test.assert_that(
	(select count(*) from public.carp where id in (:'mover', :'stayer') and lake_id = :'syndicate' and quarantine_until is null
		and abs(extract(epoch from (transit_until - (now() + interval '1 hour')))) < 5) = 2,
	'the fish belong to the other water and arrive in a day, with no quarantine inside a region'
);
select test.assert_that(
	(select count(*) from public.carp_transfers where kind = 'estate_move' and from_lake_id = :'home' and to_lake_id = :'syndicate' and price = 0 and distance_km = 140) = 2,
	'one estate move per fish'
);
select test.assert_that((select sum(transport_cost) from public.carp_transfers where kind = 'estate_move' and to_lake_id = :'syndicate') = 300, 'the lorry is charged once');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(210)::text, false);
select test.assert_refused(format('select public.move_to_my_water(array[%L]::uuid[], %L, 300, now(), null, 10)', :'listed', :'syndicate'), 'up for sale');
select test.assert_refused(format('select public.move_to_my_water(array[%L]::uuid[], %L, 300, now(), null, 10)', :'mover', :'home'), 'already on the move');
select test.assert_refused(format('select public.move_to_my_water(array[%L]::uuid[], %L, 300, now(), null, 10)', :'neighbour', :'syndicate'), 'not in your water');
select test.assert_refused(format('select public.move_to_my_water(array[%L]::uuid[], %L, 300, now(), null, 10)', :'listed', :'next_door'), 'not one of your waters');
reset role;
select test.assert_that(test.money_of(test.player(210)) = 100000 - 25 - 300, 'a refused move costs nothing');
