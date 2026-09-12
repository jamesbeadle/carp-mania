select test.sign_up(95);
select test.sign_up(96);
select test.give_lake(test.player(95), 'Ticket Pit', 'uk_ireland', 52.9, -1.2, 5) as lake \gset
select test.give_carp(:'lake', 'Repeat', 'common', 16, 80, 0) as repeat \gset
select test.give_carp(:'lake', 'Another', 'mirror', 14, 80, 0) as another \gset

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(96)::text, false);
select public.pay_day_ticket(:'lake') as visit \gset

set role service_role;
select public.record_catch(test.player(96), :'visit', :'repeat', 'The Peg', 'hair rig', 'boilie', 6, 0, 0, 0, 0);
select test.assert_refused(
	format('select public.record_catch(%L, %L, %L, %L, %L, %L, 6, 0, 0, 0, 0)', test.player(96), :'visit', :'repeat', 'The Peg', 'hair rig', 'boilie'),
	'already been on the bank today'
);
select public.record_catch(test.player(96), :'visit', :'another', 'The Peg', 'hair rig', 'boilie', 6, 0, 0, 0, 0);
reset role;
select test.assert_that((select times_caught from public.carp where id = :'repeat') = 1, 'the same fish is recorded once a visit');
select test.assert_that((select times_caught from public.carp where id = :'another') = 1, 'a different fish on the same visit still counts');
select test.assert_that((select fish_caught from public.lake_visits where id = :'visit') = 2, 'two fish on the ticket');

set role service_role;
insert into public.lake_visits (lake_id, angler_id, angler_name, fee_paid, visited_at, seed)
values (:'lake', test.player(96), 'Player 96', 20, now() - interval '3 hours', 1) returning id as stale_visit \gset
select test.assert_refused(
	format('select public.record_catch(%L, %L, %L, %L, %L, %L, 6, 0, 0, 0, 0)', test.player(96), :'stale_visit', :'another', 'The Peg', 'hair rig', 'boilie'),
	'That day ticket has expired'
);
reset role;
select test.assert_that((select times_caught from public.carp where id = :'another') = 1, 'nothing is recorded on an expired ticket');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(96)::text, false);
select public.pay_day_ticket(:'lake') as next_visit \gset
set role service_role;
select public.record_catch(test.player(96), :'next_visit', :'repeat', 'The Peg', 'hair rig', 'boilie', 6, 0, 0, 0, 0);
reset role;
select test.assert_that((select times_caught from public.carp where id = :'repeat') = 2, 'a new day ticket lets the same fish be caught again');
