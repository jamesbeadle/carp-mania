select test.sign_up(135);
select test.sign_up(136);
select test.sign_up(137);
select test.give_lake(test.player(135), 'Tie Pool', 'uk_ireland', 52.6, -1.6, 5) as lake \gset
select test.give_carp(:'lake', 'Bigger', 'common', 18, 85, 0) as bigger \gset
select test.give_carp(:'lake', 'Smaller', 'mirror', 12, 85, 0) as smaller \gset
insert into public.swims (lake_id, name, position_x, position_y) values (:'lake', 'Peg 1', 0.2, 0.2), (:'lake', 'Peg 2', 0.8, 0.8), (:'lake', 'Peg 3', 0.5, 0.8);

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(135)::text, false);
select public.book_match(:'lake', 'The Owners Blank', 1, 3, 10, 40, 50) as blank \gset
select set_config('request.jwt.claim.sub', test.player(136)::text, false);
select public.enter_match(:'blank');
reset role;
select test.assert_that(test.money_of(test.player(135)) = 100000 - 40, 'an owner hosting on their own water pays no booking fee, only the stake');
update public.matches set starts_at = now() - interval '4 hours', ends_at = now() - interval '1 hour' where id = :'blank';
select public.close_match(:'blank');
select test.assert_that(test.money_of(test.player(136)) = 100000, 'when nobody catches a thing the entry fee comes back');
select test.assert_that(test.money_of(test.player(135)) = 100000, 'and so does the stake');
select test.assert_that((select status = 'settled' from public.matches where id = :'blank') and not exists (select 1 from public.trophies where match_id = :'blank'), 'a blank match settles without trophies');
select test.assert_that(exists (select 1 from public.notifications where profile_id = test.player(136) and kind = 'match_over' and body like 'Nobody caught a thing%'), 'the field is told why');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(135)::text, false);
select public.book_match(:'lake', 'The Cancelled Cup', 2, 6, 15, 0, 50) as cancelled \gset
select set_config('request.jwt.claim.sub', test.player(136)::text, false);
select public.enter_match(:'cancelled');
select set_config('request.jwt.claim.sub', test.player(135)::text, false);
select public.cancel_match(:'cancelled');
reset role;
select test.assert_that(test.money_of(test.player(136)) = 100000, 'a cancelled match gives the entry fee back');
select test.assert_that((select status = 'cancelled' from public.matches where id = :'cancelled'), 'the match is marked off');
select test.assert_that(exists (select 1 from public.notifications where profile_id = test.player(136) and kind = 'match_cancelled'), 'the entrants are told it is off');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(135)::text, false);
select public.book_match(:'lake', 'The Tie Trophy', 1, 3, 10, 0, 100) as tie \gset
select set_config('request.jwt.claim.sub', test.player(136)::text, false);
select public.enter_match(:'tie');
select set_config('request.jwt.claim.sub', test.player(137)::text, false);
select public.enter_match(:'tie');
reset role;
update public.matches set starts_at = now() - interval '10 minutes', ends_at = now() + interval '2 hours' where id = :'tie';
set role authenticated;
select set_config('request.jwt.claim.sub', test.player(136)::text, false);
select public.pay_day_ticket(:'lake') as visit_a \gset
select set_config('request.jwt.claim.sub', test.player(137)::text, false);
select public.pay_day_ticket(:'lake') as visit_b \gset
reset role;
select public.record_catch(test.player(136), :'visit_a', :'bigger', 'Peg 1', 'hair rig', 'boilie', 6, 0, 0, 0, 0);
select public.record_catch(test.player(137), :'visit_b', :'smaller', 'Peg 2', 'hair rig', 'boilie', 6, 0, 0, 0, 0);
update public.matches set ends_at = now() where id = :'tie';
select public.close_match(:'tie');
select test.assert_that(test.money_of(test.player(136)) = 100000, 'a tie on most catches splits that share, and the biggest fish gets the rest');
select test.assert_that(test.money_of(test.player(137)) = 100000, 'the other half of the tie gets the same');
select test.assert_that((select count(*) from public.trophies where match_id = :'tie' and profile_id = test.player(136)) = 2, 'the angler with the bigger fish takes both trophies');
select test.assert_that((select prize = 0 from public.trophies where match_id = :'tie' and profile_id = test.player(136) and kind = 'biggest_fish'), 'though the biggest fish carries no money when the host gave it all to most catches');
select test.assert_that((select count(*) from public.trophies where match_id = :'tie' and profile_id = test.player(137)) = 1, 'the other angler shares the most-catches trophy');
