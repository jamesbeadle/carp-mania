select test.sign_up(330);
select test.give_lake(test.player(330), 'Reset Pit', 'uk_ireland', 51.5, -0.5, 5) as lake \gset
select test.give_carp(:'lake', 'Old Timer', 'mirror', 30, 80, 0) as fish \gset
insert into public.catches (lake_id, carp_id, angler_id, angler_name, weight_lb, swim_name, rig, bait, hook_size)
	values (:'lake', :'fish', test.player(330), 'Player330', 30, 'The Peg', 'hair', 'boilie', 4);
update public.profiles set money = 250000, experience = 40, watercraft = 70, current_lake_id = :'lake' where id = test.player(330);
update public.profiles set display_name = 'Reset330' where id = test.player(330);

select public.reset_the_game();

select test.assert_that((select display_name from public.profiles where id = test.player(330)) = 'Reset330', 'the angler keeps their name');
select test.assert_that((select money = 100000 and experience = 0 and watercraft = 25 and current_lake_id is null from public.profiles where id = test.player(330)), 'the purse, the experience and the skills start again');
select test.assert_that(not exists (select 1 from public.lakes), 'every water is gone');
select test.assert_that(not exists (select 1 from public.catches) and not exists (select 1 from public.carp), 'and every fish and catch with it');
select test.assert_that((select count(*) from public.fishermen where profile_id = test.player(330)) = 1, 'the angler has one fisherman again');
select test.assert_that((select generation from public.fishermen where id = (select current_fisherman_id from public.profiles where id = test.player(330))) = 1, 'and it is the first generation');
select test.assert_that(exists (select 1 from public.tackle_owned where profile_id = test.player(330)), 'with the starter kit in the bag');
