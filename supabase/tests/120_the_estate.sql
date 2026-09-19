select test.sign_up(120);
select test.sign_up(121);
select test.give_lake(test.player(120), 'First Water', 'uk_ireland', 51.5, -0.5, 5) as first \gset
select test.give_lake(test.player(120), 'Second Water', 'uk_ireland', 52.5, -1.5, 5) as second \gset
select test.give_lake(test.player(121), 'Sellers Pool', 'uk_ireland', 53.0, -2.0, 5) as sellers \gset
select test.give_carp(:'sellers', 'For Sale', 'mirror', 24, 90, 0) as for_sale \gset

select test.assert_that((public.current_lake_of(test.player(120))).id = :'first', 'with nothing chosen the first water bought is the current one');
update public.profiles set current_lake_id = :'second' where id = test.player(120);
select test.assert_that((public.current_lake_of(test.player(120))).id = :'second', 'the chosen water is the current one');

set role service_role;
select public.buy_farm_pack(test.player(120), 'meadow-fisheries-1-stockies', jsonb_build_array(test.farm_fish('Estate Stockie', 5)), 150, 250, now() + interval '1 hour', null, 120);
reset role;
select test.assert_that((select to_lake_id = :'second' from public.carp_transfers where carp_name = 'Estate Stockie'), 'the farm delivers to the current water');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(121)::text, false);
select public.list_carp_for_sale(:'for_sale', 'buy_now', 1000, null, 1200, 24) as listing \gset
select set_config('request.jwt.claim.sub', test.player(120)::text, false);
select public.buy_now(:'listing');
reset role;
select test.assert_that((select to_lake_id = :'second' from public.carp_transfers where carp_name = 'For Sale' and kind = 'sale'), 'a bought fish travels to the current water');
update public.profiles set current_lake_id = null where id = test.player(120);
select test.assert_that((public.current_lake_of(test.player(120))).id = :'first', 'with the choice cleared the first water is current again');
