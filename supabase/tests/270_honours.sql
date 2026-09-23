select test.sign_up(270);
select test.sign_up(271);
select test.give_lake(test.player(270), 'Honours Pit', 'uk_ireland', 51.5, -0.5, 5) as lake \gset
select test.give_carp(:'lake', 'Big Bertha', 'mirror', 48, 80, 0) as bertha \gset
select test.give_carp(:'lake', 'A Twenty', 'common', 22, 80, 0) as twenty \gset
insert into public.catches (lake_id, carp_id, angler_id, angler_name, weight_lb, swim_name, rig, bait, hook_size, caught_at) values
	(:'lake', :'twenty', test.player(271), 'Player271', 22, 'The Peg', 'hair', 'boilie', 4, now() - interval '3 days');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(271)::text, false);
select public.pay_day_ticket(:'lake') as visit \gset
set role service_role;
select public.record_catch(test.player(271), :'visit', :'bertha', 'The Peg', 'hair rig', 'boilie', 6, 1, 0.5, 3, 1, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-shelf_life_boilie', 23) as night_catch \gset
reset role;
select test.assert_that((select hour_of_day = 23 and visit_id = :'visit' from public.catches where id = :'night_catch'), 'the catch remembers its hour and its ticket');
select * from public.award_tallies_of(test.player(271)) \gset tally_
select test.assert_that(:tally_best_lb = 48 and :tally_fish_landed = 2 and :tally_light_rod_best_lb = 48 and :tally_night_fish = 1 and :tally_regions_fished = 1, 'the tallies read the catches');
select test.assert_that(:tally_ticket_kinds_fished = 1 and :tally_records_set = 1 and :tally_record_waters = 1, 'the ticket, the record and the water are counted');

set role service_role;
select test.assert_that(public.grant_award(test.player(271), 'light_rod', :'night_catch', 'Light rod', 'A forty on a light rod'), 'a new award is granted');
select test.assert_that(not public.grant_award(test.player(271), 'light_rod', :'night_catch', 'Light rod', 'A forty on a light rod'), 'and only once');
reset role;
select test.assert_that((select count(*) from public.notifications where profile_id = test.player(271) and kind = 'award_won') = 1, 'the award is a notification');
select test.assert_that((select count(*) from public.world_events where kind = 'award' and lake_id = :'lake') = 1, 'and a line in the news');

select * from public.biggest_fish_in_the_game() \gset biggest_
select test.assert_that(:biggest_weight_lb >= 48 and :'biggest_is_open' = 't', 'the biggest fish in the game is at least Bertha, on an open water');
