select test.sign_up(150);
select test.sign_up(151);
select test.give_lake(test.player(150), 'Listed Water', 'uk_ireland', 52.1, -1.1, 5) as lake \gset
select test.give_carp(:'lake', 'Listed One', 'common', 18, 85, 0) as one \gset
select test.give_carp(:'lake', 'Listed Two', 'mirror', 27.5, 85, 0) as two \gset
insert into public.swims (lake_id, name, position_x, position_y) values (:'lake', 'Peg 1', 0.2, 0.2), (:'lake', 'Peg 2', 0.8, 0.8), (:'lake', 'Peg 3', 0.5, 0.8);

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(151)::text, false);
select test.assert_that(
	(select carp_count = 102 and heaviest_lb = 27.5 and swim_count = 3 and owner_name = 'Player150' and name = 'Listed Water' from public.lake_summaries where id = :'lake'),
	'a lake summary counts every fish in the water, shoal fish included, with the heaviest fish, the pegs and the owner'
);
select public.pay_day_ticket(:'lake') as visit \gset
reset role;
select public.record_catch(test.player(151), :'visit', :'two', 'Peg 1', 'hair rig', 'boilie', 6, 2, 2, 2, 2, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-shelf_life_boilie');
set role authenticated;
select set_config('request.jwt.claim.sub', test.player(151)::text, false);
select test.assert_that(
	(select personal_best_lb = 27.5 and catches = 1 and rating > 25 and display_name = 'Player151' from public.angler_summaries where id = test.player(151)),
	'an angler summary carries the personal best, the catch count and the rating'
);
reset role;
update public.lakes set is_public = false where id = :'lake';
set role authenticated;
select set_config('request.jwt.claim.sub', test.player(151)::text, false);
select test.assert_that(not exists (select 1 from public.lake_summaries where id = :'lake'), 'a private water is not in the list for other anglers');
select set_config('request.jwt.claim.sub', test.player(150)::text, false);
select test.assert_that(exists (select 1 from public.lake_summaries where id = :'lake'), 'but the owner still sees it');
reset role;

reset role;
update public.lakes set is_public = true where id = :'lake';
update public.carp set fame = 40 where id = :'two';
set role authenticated;
select set_config('request.jwt.claim.sub', test.player(151)::text, false);
select test.assert_that(
	(select count(*) = 1 and bool_and(name = 'Listed Two' and lake_name = 'Listed Water') from public.famous_fish_caught_by(test.player(151), 20)),
	'the famous fish an angler has caught come back with the water they live in'
);
select test.assert_that(not exists (select 1 from public.famous_fish_caught_by(test.player(150), 20)), 'an angler who never caught the fish is not credited with it');
reset role;

select current_fisherman_id as fisherman from public.profiles where id = test.player(151) \gset
select public.record_catch(test.player(151), :'visit', :'one', 'Peg 2', 'hair rig', 'boilie', 6, 2, 2, 2, 2, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-shelf_life_boilie');
insert into public.catches (lake_id, carp_id, angler_id, angler_name, weight_lb, swim_name, rig, bait, hook_size, fisherman_id, caught_at)
values (:'lake', :'two', test.player(151), 'Player151', 26, 'Peg 3', 'hair rig', 'boilie', 6, :'fisherman', now() - interval '3 days');
set role authenticated;
select set_config('request.jwt.claim.sub', test.player(151)::text, false);
select test.assert_that(
	(select count(*) = 2 and max(times_caught) = 2 and (array_agg(carp_id order by best_lb desc))[1] = :'two' from public.fish_known_by(:'fisherman')),
	'the fish a fisherman knows are counted once each with the best weight, heaviest first'
);
reset role;
