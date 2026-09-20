select test.sign_up(180);
select test.sign_up(181);
select test.sign_up(182);
select test.sign_up(183);
select test.give_lake(test.player(180), 'Rivalry Water', 'danube', 47.5, 19.0, 6) as lake \gset
select test.give_carp(:'lake', 'The First', 'mirror', 45, 85, 0) as first \gset
select test.give_carp(:'lake', 'The Second', 'mirror', 46, 85, 0) as second \gset
select test.give_carp(:'lake', 'The Third', 'mirror', 47, 85, 0) as third \gset
select test.give_carp(:'lake', 'Tiddler', 'common', 5, 85, 0) as tiddler \gset
insert into public.swims (lake_id, name, position_x, position_y) values (:'lake', 'Peg 1', 0.3, 0.3);

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(181)::text, false);
select public.pay_day_ticket(:'lake') as holder_visit \gset
select set_config('request.jwt.claim.sub', test.player(182)::text, false);
select public.pay_day_ticket(:'lake') as taker_visit \gset
select set_config('request.jwt.claim.sub', test.player(183)::text, false);
select public.pay_day_ticket(:'lake') as third_visit \gset
reset role;

select public.record_catch(test.player(181), :'holder_visit', :'first', 'Peg 1', 'hair rig', 'boilie', 6, 2, 2, 2, 2, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-fishmeal_boilie');
select public.record_catch(test.player(182), :'taker_visit', :'second', 'Peg 1', 'hair rig', 'boilie', 6, 2, 2, 2, 2, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-fishmeal_boilie');

select test.assert_that(
	(select count(*) = 1 from public.notifications where profile_id = test.player(181) and kind = 'record_lost'),
	'the holder hears once when one catch takes every record they held'
);
select test.assert_that(
	(select title = 'Player 182 has taken your world record at Rivalry Water' and body = '46 lb to your 45 lb. It is there to be taken back.' and link = '/anglers/' || test.player(182)
		from public.notifications where profile_id = test.player(181) and kind = 'record_lost'),
	'the note names the taker, the widest record taken, the water and both weights, and leads to the taker''s page'
);
select test.assert_that(
	not exists (select 1 from public.notifications where profile_id = test.player(181) and kind = 'board_place_lost'),
	'losing the record is the note; the board place it cost goes without saying'
);
select test.assert_that(
	not exists (select 1 from public.notifications where profile_id = test.player(182) and kind in ('record_lost', 'board_place_lost')),
	'the taker hears nothing'
);

select public.record_catch(test.player(183), :'third_visit', :'third', 'Peg 1', 'hair rig', 'boilie', 6, 2, 2, 2, 2, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-fishmeal_boilie') as third_catch \gset
select test.assert_that(
	(select title = 'You''ve dropped to No. 3 on the world board' and body = 'Player 183''s 47 lb went in above you.' and link = '/world/hall-of-fame'
		from public.notifications where profile_id = test.player(181) and kind = 'board_place_lost'),
	'an angler pushed down the world board hears where they stand now and whose fish did it'
);
select test.assert_that(
	(select count(*) = 1 from public.notifications where profile_id = test.player(182) and kind = 'record_lost'),
	'the new holder loses the record in turn'
);
select test.assert_that(
	(select count(*) = 2 and bool_or(angler_id = test.player(181) and new_rank = 3) and bool_or(angler_id = test.player(182) and new_rank = 2) from public.board_places_taken(:'third_catch', 2)),
	'a board two places long would have lost the old holder off its end'
);
select test.assert_that(
	not exists (select 1 from public.board_places_taken(:'third_catch', 1) where angler_id = test.player(181)),
	'nobody drops off a board they were never on'
);

select count(*) as notes_before_the_tiddler from public.notifications where kind in ('record_lost', 'board_place_lost') \gset
select public.record_catch(test.player(183), :'third_visit', :'tiddler', 'Peg 1', 'hair rig', 'boilie', 6, 2, 2, 2, 2, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-fishmeal_boilie');
select test.assert_that(
	(select count(*) = :notes_before_the_tiddler from public.notifications where kind in ('record_lost', 'board_place_lost')),
	'a catch that is not the angler''s best moves nobody'
);

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(181)::text, false);
select test.assert_that(
	(select angler_id = test.player(182) and display_name = 'Player 182' and best_lb = 46 and rank = 2 from public.board_neighbours(test.player(181)) where side = 'above'),
	'the one to beat is the angler one place above on the world board'
);
select test.assert_that(
	(select best_lb < 45 and rank = 4 from public.board_neighbours(test.player(181)) where side = 'below'),
	'the one behind is the angler one place below'
);
select test.assert_that(
	not exists (select 1 from public.board_neighbours(test.player(183)) where side = 'above')
		and (select angler_id = test.player(182) from public.board_neighbours(test.player(183)) where side = 'below'),
	'the angler at the top has nobody above and the second-best behind'
);
select test.assert_that(
	(select count(*) = 1 and bool_and(side = 'above' and best_lb > 0) from public.board_neighbours(test.player(180))),
	'an angler with nothing on the bank sees the last rung of the ladder, and nobody behind'
);
reset role;
