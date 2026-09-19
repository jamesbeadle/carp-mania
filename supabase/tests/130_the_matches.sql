select test.sign_up(130);
select test.sign_up(131);
select test.sign_up(132);
select test.sign_up(133);
select test.sign_up(134);
select test.give_lake(test.player(130), 'Match Water', 'uk_ireland', 52.4, -1.4, 5) as lake \gset
select test.give_carp(:'lake', 'Sixteen', 'common', 16, 85, 0) as sixteen \gset
select test.give_carp(:'lake', 'Fourteen', 'mirror', 14, 85, 0) as fourteen \gset
select test.give_carp(:'lake', 'Thirty', 'mirror', 30, 85, 0) as thirty \gset

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(131)::text, false);
select test.assert_refused(format('select public.book_match(%L, %L, 1, 3, 25, 100, 50)', :'lake', 'The Match Water Open'), 'no pegs');
reset role;
insert into public.swims (lake_id, name, position_x, position_y) values (:'lake', 'Peg 1', 0.2, 0.2), (:'lake', 'Peg 2', 0.8, 0.8);

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(131)::text, false);
select test.assert_refused(format('select public.book_match(%L, %L, 1, 3, 25, 100, 50)', :'lake', 'Op'), 'needs a name');
select test.assert_refused(format('select public.book_match(%L, %L, 1, 5, 25, 100, 50)', :'lake', 'The Match Water Open'), 'lasts 3, 6, 12 or 24 hours');
select test.assert_refused(format('select public.book_match(%L, %L, 1, 3, 0, 0, 50)', :'lake', 'The Match Water Open'), 'Put something in the pot');
select test.assert_refused(format('select public.book_match(%L, %L, 200, 3, 25, 100, 50)', :'lake', 'The Match Water Open'), 'between an hour and a week');
select public.book_match(:'lake', 'The Match Water Open', 1, 3, 25, 100, 50) as match \gset
select test.assert_refused(format('select public.book_match(%L, %L, 2, 3, 25, 0, 50)', :'lake', 'A Clash'), 'already booked then');
reset role;
select test.assert_that(test.money_of(test.player(131)) = 100000 - 360 - 100, 'the host pays a booking fee of six anglers an hour and puts up the stake');
select test.assert_that(test.money_of(test.player(130)) = 100000 + 360, 'the owner pockets the booking fee');
select test.assert_that((select pegs = 2 and booking_fee = 360 and status = 'open' from public.matches where id = :'match'), 'the match is booked with a peg for every swim');
select test.assert_that(exists (select 1 from public.notifications where profile_id = test.player(130) and kind = 'match_booked'), 'the owner hears the water is booked');
select test.assert_that(exists (select 1 from public.world_events where kind = 'match_announced' and lake_id = :'lake'), 'the match is announced to the world');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(132)::text, false);
select public.enter_match(:'match');
select test.assert_refused(format('select public.enter_match(%L)', :'match'), 'already in');
select test.assert_refused(format('select public.cancel_match(%L)', :'match'), 'not your match');
select set_config('request.jwt.claim.sub', test.player(133)::text, false);
select public.enter_match(:'match');
select set_config('request.jwt.claim.sub', test.player(134)::text, false);
select test.assert_refused(format('select public.enter_match(%L)', :'match'), 'Every peg is taken');
select public.pay_day_ticket(:'lake') as early_visit \gset
reset role;
select test.assert_that(test.money_of(test.player(132)) = 100000 - 25, 'an entrant pays the entry fee');
select test.assert_that(test.money_of(test.player(134)) = 100000 - 20, 'before the match starts anyone can still buy a ticket');

update public.matches set starts_at = now() - interval '10 minutes', ends_at = now() + interval '2 hours' where id = :'match';
set role authenticated;
select set_config('request.jwt.claim.sub', test.player(131)::text, false);
select test.assert_refused(format('select public.cancel_match(%L)', :'match'), 'has started');
select set_config('request.jwt.claim.sub', test.player(134)::text, false);
select test.assert_refused(format('select public.pay_day_ticket(%L)', :'lake'), 'booked for a match');
select set_config('request.jwt.claim.sub', test.player(130)::text, false);
select test.assert_refused(format('select public.pay_day_ticket(%L)', :'lake'), 'booked for a match');
select set_config('request.jwt.claim.sub', test.player(132)::text, false);
select public.pay_day_ticket(:'lake') as visit_a \gset
select set_config('request.jwt.claim.sub', test.player(133)::text, false);
select public.pay_day_ticket(:'lake') as visit_b \gset
select test.assert_refused('select public.close_ended_matches()', 'permission denied');
reset role;
select test.assert_that(test.money_of(test.player(132)) = 100000 - 25, 'an entrant fishes the match without paying for a ticket');
select public.record_catch(test.player(132), :'visit_a', :'sixteen', 'Peg 1', 'hair rig', 'boilie', 6, 0, 0, 0, 0, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-shelf_life_boilie');
select public.record_catch(test.player(132), :'visit_a', :'fourteen', 'Peg 1', 'hair rig', 'boilie', 6, 0, 0, 0, 0, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-shelf_life_boilie');
select public.record_catch(test.player(133), :'visit_b', :'thirty', 'Peg 2', 'hair rig', 'boilie', 6, 0, 0, 0, 0, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-shelf_life_boilie');
select test.assert_that(
	(select angler_id = test.player(132) and catches = 2 and heaviest_lb = 16 and heaviest_carp_id = :'sixteen' from public.match_board(:'match') limit 1),
	'the board puts the angler with most fish first, with the best of them named'
);
select test.assert_refused(format('select public.close_match(%L)', :'match'), 'still running');

update public.matches set ends_at = now() where id = :'match';
select test.assert_that(public.close_ended_matches() = 1, 'the scheduler closes the ended match');
select test.assert_that((select status = 'settled' and settled_at is not null from public.matches where id = :'match'), 'the match is settled');
select test.assert_that(test.money_of(test.player(132)) = 100000 - 25 + 75, 'most catches takes half of the pot of two entries and the stake');
select test.assert_that(test.money_of(test.player(133)) = 100000 - 25 + 75, 'the biggest fish takes the other half');
select test.assert_that((select kind = 'most_catches' and catches = 2 and prize = 75 and lake_name = 'Match Water' from public.trophies where match_id = :'match' and profile_id = test.player(132)), 'a most-catches trophy');
select test.assert_that((select kind = 'biggest_fish' and heaviest_lb = 30 and prize = 75 from public.trophies where match_id = :'match' and profile_id = test.player(133)), 'a biggest-fish trophy');
select test.assert_that((select fisherman_id = (select current_fisherman_id from public.profiles where id = test.player(133)) from public.trophies where match_id = :'match' and profile_id = test.player(133)), 'the trophy belongs to the fisherman who won it');
select test.assert_that((select count(*) from public.notifications where kind = 'match_won' and profile_id in (test.player(132), test.player(133))) = 2, 'both winners hear of it');
select test.assert_that(exists (select 1 from public.world_events where kind = 'match_won' and lake_id = :'lake'), 'the result is news');
select test.assert_that((select trophies = 1 and prize_money = 75 from public.match_winners('world', 10) where angler_id = test.player(132)), 'the hall of fame counts the trophies');
select test.assert_that((select count(*) from public.match_winners('uk_ireland', 10)) >= 2, 'and knows the region they were won in');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(134)::text, false);
select public.pay_day_ticket(:'lake') as late_visit \gset
reset role;
select test.assert_that(test.money_of(test.player(134)) = 100000 - 40, 'once the match is over the water is open again at the usual price');
