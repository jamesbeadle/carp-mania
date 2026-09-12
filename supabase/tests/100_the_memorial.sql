select test.sign_up(100);
select test.sign_up(101);
select test.give_lake(test.player(100), 'Memorial Mere', 'uk_ireland', 52.0, -1.0, 5) as lake \gset
select test.give_lake(test.player(101), 'Bidders Pool', 'uk_ireland', 52.5, -1.5, 5) as bidders_lake \gset
select test.give_carp(:'lake', 'Old Warrior', 'mirror', 38, 85, 40) as warrior \gset
select test.give_carp(:'lake', 'Poorly Pete', 'common', 14, 20, 0) as poorly \gset
select test.give_carp(:'lake', 'Listed Lil', 'common', 24, 90, 5) as listed \gset
insert into public.catches (lake_id, carp_id, angler_name, weight_lb, swim_name, rig, bait, hook_size) values (:'lake', :'warrior', 'Ada', 38, 'The Point', 'hair', 'boilie', 4);

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(100)::text, false);
select public.list_carp_for_sale(:'listed', 'auction', 1000, null, null, 24) as listing \gset
select set_config('request.jwt.claim.sub', test.player(101)::text, false);
select public.place_bid(:'listing', 1000);
select test.assert_that(test.money_of(test.player(101)) < 100000, 'the bid is held');
select test.assert_refused(format('select public.bury_carp(array[%L]::uuid[], %L)', :'warrior', 'old_age'), 'permission denied for function bury_carp');
reset role;

select test.assert_that(public.bury_carp(array[:'warrior', :'poorly', :'listed']::uuid[], 'old_age') = 3, 'three fish are buried');
select test.assert_that((select count(*) from public.carp where id in (:'warrior', :'poorly', :'listed')) = 0, 'buried fish leave the living stock');
select test.assert_that(
	(select name = 'Old Warrior' and weight_lb = 38 and fame = 40 and lake_name = 'Memorial Mere' and death_cause = 'old_age' from public.carp_memorial where id = :'warrior'),
	'the memorial keeps the fish as it was'
);
select test.assert_that((select carp_id = :'warrior' from public.catches where angler_name = 'Ada'), 'a catch still points at the dead fish');
select test.assert_that(test.money_of(test.player(101)) = 100000, 'the bidder on a fish that died gets everything back');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(101)::text, false);
select test.assert_that((select count(*) from public.carp_memorial where id = :'warrior') = 1, 'anyone can read the memorial');
select test.assert_refused(format('insert into public.carp_memorial (id, lake_name, name, strain, weight_lb, age_years, origin, death_cause) values (%L, %L, %L, %L, 1, 1, %L, %L)', gen_random_uuid(), 'x', 'x', 'common', 'wild', 'pike'), 'row-level security');
select test.assert_that(not exists (select 1 from public.most_fish_landed('world', 100) where angler_name = 'Ada'), 'unnamed visiting anglers do not make the board');
select test.assert_that(exists (select 1 from public.waters_of_legend('uk_ireland', 50) where lake_name = 'Memorial Mere' and heaviest_lb = 38 and owner_name = 'Player 100'), 'the water of legend credits its owner');
reset role;

select test.give_carp(:'lake', 'Ticket Fish', 'common', 18, 80, 0) as ticket_fish \gset
set role authenticated;
select set_config('request.jwt.claim.sub', test.player(101)::text, false);
select public.pay_day_ticket(:'lake') as visit \gset
reset role;
select public.record_catch(test.player(101), :'visit', :'ticket_fish', 'The Peg', 'hair rig', 'boilie', 6, 0, 0, 0, 0) as player_catch \gset
select test.assert_that((select owner_name = 'Player 100' and angler_name = 'Player 101' from public.catches where id = :'player_catch'), 'a catch credits the owner of the water as well as the angler');
select test.assert_that(exists (select 1 from public.most_fish_landed('world', 100) where angler_name = 'Player 101' and catches = 1 and heaviest_lb = 18), 'a signed-in angler makes the board');
