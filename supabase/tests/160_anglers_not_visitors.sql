select test.sign_up(160);
select test.sign_up(161);
select test.give_lake(test.player(160), 'Far East Water', 'japan_east_asia', 35.6, 139.7, 6) as lake \gset
select test.give_carp(:'lake', 'The Visitor Fish', 'mirror', 30, 85, 0) as big \gset
select test.give_carp(:'lake', 'The Angler Fish', 'common', 25, 85, 0) as small \gset
insert into public.swims (lake_id, name, position_x, position_y) values (:'lake', 'Peg 1', 0.3, 0.3);
insert into public.catches (lake_id, carp_id, angler_id, angler_name, weight_lb, swim_name, rig, bait, hook_size)
values (:'lake', :'big', null, 'Ash "Night Owl"', 30, 'Peg 1', 'hair rig', 'boilie', 6);

select test.assert_that(
	(select is_lake_record and is_region_record from public.records_broken_by(:'lake', test.player(161), :'small', 25)),
	'a visitor''s bigger catch does not stand in the way of an angler''s record'
);

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(161)::text, false);
select public.pay_day_ticket(:'lake') as visit \gset
reset role;
select public.record_catch(test.player(161), :'visit', :'small', 'Peg 1', 'hair rig', 'boilie', 6, 2, 2, 2, 2, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-fishmeal_boilie');

select test.assert_that(
	(select payload ->> 'anglerId' = test.player(161)::text and payload ->> 'scope' = 'region' from public.world_events where kind = 'record' and lake_id = :'lake' order by created_at desc limit 1),
	'the record event names the angler who set it, at the widest scope it broke'
);
select test.assert_that(
	(select heaviest_lb = 25 from public.waters_of_legend('japan_east_asia', 5) where lake_id = :'lake'),
	'a water of legend is judged by what anglers had there, not visitors'
);

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(161)::text, false);
select test.assert_that(
	(select weight_lb = 30 and angler_name = 'Ash "Night Owl"' and lake_name = 'Far East Water' from public.visitors_best('japan_east_asia')),
	'the visitors'' best stays in the background, on its own'
);
reset role;

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(161)::text, false);
select test.assert_that(
	(select rank = 1 and best_lb = 25 and anglers = 1 from public.angler_standing('japan_east_asia')),
	'an angler''s standing counts anglers, not visitors'
);
select set_config('request.jwt.claim.sub', test.player(160)::text, false);
select test.assert_that(
	(select rank = 2 and best_lb = 0 and anglers = 1 from public.angler_standing('japan_east_asia')),
	'an angler with nothing on the bank stands behind everyone who has'
);
reset role;
