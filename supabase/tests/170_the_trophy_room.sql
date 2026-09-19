select test.sign_up(170);
select test.sign_up(171);
select test.sign_up(172);
select test.give_lake(test.player(170), 'Trophy Water', 'south_africa', -33.9, 18.4, 6) as lake \gset
select test.give_carp(:'lake', 'Small Fry', 'common', 15, 85, 0) as small \gset
select test.give_carp(:'lake', 'The Prize', 'mirror', 31, 85, 0) as prize \gset
select test.give_carp(:'lake', 'Twenty', 'common', 20, 85, 0) as twenty \gset
insert into public.swims (lake_id, name, position_x, position_y) values (:'lake', 'Peg 1', 0.3, 0.3);

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(171)::text, false);
select public.pay_day_ticket(:'lake') as visit \gset
select set_config('request.jwt.claim.sub', test.player(172)::text, false);
select public.pay_day_ticket(:'lake') as rival_visit \gset
reset role;
select public.record_catch(test.player(171), :'visit', :'small', 'Peg 1', 'hair rig', 'boilie', 6, 2, 2, 2, 2, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-shelf_life_boilie');
select public.record_catch(test.player(171), :'visit', :'prize', 'Peg 1', 'hair rig', 'boilie', 6, 2, 2, 2, 2, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-shelf_life_boilie');
select public.record_catch(test.player(172), :'rival_visit', :'twenty', 'Peg 1', 'hair rig', 'boilie', 6, 2, 2, 2, 2, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-shelf_life_boilie');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(172)::text, false);
select test.assert_that(
	(select count(*) = 2 and (array_agg(weight_lb order by weight_lb desc))[1] = 31 from public.catch_cards(test.player(171), 5)),
	'the cards are the angler''s biggest catches, heaviest first'
);
select test.assert_that(
	(select was_personal_best and was_lake_record and was_region_record and not was_world_record and holds_lake_record and holds_region_record
		from public.catch_cards(test.player(171), 5) where weight_lb = 31),
	'the prize was a personal best and a lake and region record on the day, and still holds both'
);
select test.assert_that(
	(select was_personal_best and was_lake_record and not holds_lake_record from public.catch_cards(test.player(171), 5) where weight_lb = 15),
	'the first fish on a water was its record for a while, and is not any more'
);
select test.assert_that(
	(select count(*) = 2 and bool_and(weight_lb = 31) and bool_or(scope = 'lake' and scope_name = 'Trophy Water') and bool_or(scope = 'region' and scope_id = 'south_africa') from public.records_held_by(test.player(171))),
	'the angler holds the lake and region records with the prize, and no world record'
);
select test.assert_that(not exists (select 1 from public.records_held_by(test.player(172))), 'a twenty behind a thirty-one holds nothing');
select test.assert_that(
	(select bool_and(reached_at is not null) from public.milestones_of(test.player(171)) where kind in ('twenty', 'thirty', 'first_record'))
		and (select bool_and(reached_at is null) from public.milestones_of(test.player(171)) where kind in ('forty', 'fifty', 'hundred_fish', 'five_hundred_fish', 'first_trophy')),
	'milestones: the first twenty and thirty and the first record are reached, nothing beyond'
);
select test.assert_that(
	(select reached_at = (select min(caught_at) from public.catches where angler_id = test.player(171)) from public.milestones_of(test.player(171)) where kind = 'first_record'),
	'the first record was the first fish on an empty water'
);
select test.assert_that(
	(select best_lb = 31 and best_rank between 1 and 5 and skill_rank >= 1 and anglers >= 3 from public.angler_ranks(test.player(171))),
	'ranks count anglers by personal best and by skill'
);
select test.assert_that(
	(select best_lb = 0 and best_rank > (select best_rank from public.angler_ranks(test.player(171))) from public.angler_ranks(test.player(170))),
	'an angler who has caught nothing ranks behind one who has'
);
reset role;
