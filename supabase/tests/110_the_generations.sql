select test.sign_up(110);
select test.sign_up(111);
select test.give_lake(test.player(110), 'Dynasty Water', 'uk_ireland', 52.2, -1.2, 5) as lake \gset
select test.give_carp(:'lake', 'First Fish', 'common', 22, 85, 0) as first_fish \gset
select test.give_carp(:'lake', 'Second Fish', 'mirror', 19, 85, 0) as second_fish \gset

select test.assert_that(
	(select generation = 1 and name = 'Player 111' and born_age between 20 and 30 and retires_at_age between 80 and 100 and retired_at is null
		from public.fishermen where id = (select current_fisherman_id from public.profiles where id = test.player(111))),
	'signing up begins the first fisherman of the line'
);
select current_fisherman_id as old_fisherman from public.profiles where id = test.player(111) \gset

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(111)::text, false);
select public.pay_day_ticket(:'lake') as visit \gset
select test.assert_refused(format('select public.retire_fisherman(%L, %L)', test.player(111), 'Young Tom'), 'permission denied for function retire_fisherman');
reset role;
select public.record_catch(test.player(111), :'visit', :'first_fish', 'The Peg', 'hair rig', 'boilie', 6, 2, 2, 2, 2) as first_catch \gset
select test.assert_that((select fisherman_id = :'old_fisherman' from public.catches where id = :'first_catch'), 'a catch is stamped with the fisherman who had it');
select test.assert_that((select line_selection = 27 from public.profiles where id = test.player(111)), 'the first of the line learns at the ordinary pace');

select test.assert_refused(format('select public.retire_fisherman(%L, %L)', test.player(111), 'Young Tom'), 'years in him yet');
update public.fishermen set started_at = now() - interval '400 days' where id = :'old_fisherman';
select test.assert_that((select public.diary_age_of(fisherman, now()) between 120 and 130 from public.fishermen as fisherman where id = :'old_fisherman'), 'four hundred real days is a hundred diary years');
select test.assert_refused(format('select public.retire_fisherman(%L, %L)', test.player(111), 'T'), 'needs a name');
select public.retire_fisherman(test.player(111), '  Young Tom ') as heir \gset

select test.assert_that(
	(select retired_at is not null and catches = 1 and personal_best_lb = 22 and final_experience = 1 from public.fishermen where id = :'old_fisherman'),
	'the old fisherman is closed with his catches and personal best'
);
select test.assert_that(
	(select generation = 2 and name = 'Young Tom' and retired_at is null from public.fishermen where id = :'heir'),
	'the heir is the second of the line'
);
select test.assert_that(
	(select current_fisherman_id = :'heir' and display_name = 'Young Tom' and line_selection = 40 and watercraft = 40 and experience = 0 from public.profiles where id = test.player(111)),
	'the heir takes the name, starts at 40 and has landed nothing'
);
select test.assert_that((select angler_name = 'Player 111' from public.catches where id = :'first_catch'), 'the old catch keeps the old name');
select test.assert_that(exists (select 1 from public.world_events where kind = 'handover' and lake_id = (select id from public.lakes where owner_id = test.player(111) limit 1)) or not exists (select 1 from public.lakes where owner_id = test.player(111)), 'a handover is news only where there is a water');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(111)::text, false);
select public.pay_day_ticket(:'lake') as second_visit \gset
reset role;
select * from public.records_broken_by(:'lake', test.player(111), :'second_fish', 19) \gset broken_
select test.assert_that(:'broken_is_personal_best' = 't', 'a 19 lb fish is a personal best for the heir although the old man had a 22');
select public.record_catch(test.player(111), :'second_visit', :'second_fish', 'The Peg', 'hair rig', 'boilie', 6, 2, 2, 2, 2);
select test.assert_that((select line_selection = 43 from public.profiles where id = test.player(111)), 'the heir, taught by the old man, learns half as fast again');
select test.assert_that((select count(*) from public.catches where fisherman_id = :'heir') = 1 and (select count(*) from public.catches where fisherman_id = :'old_fisherman') = 1, 'each fisherman keeps his own catches');
