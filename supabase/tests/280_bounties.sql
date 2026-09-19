select test.sign_up(280);
select test.sign_up(281);
select test.sign_up(282);
select test.give_lake(test.player(280), 'Bounty Water', 'uk_ireland', 51.5, -0.5, 5) as lake \gset
select test.give_lake(test.player(281), 'The Winner''s Own', 'uk_ireland', 52.5, -1.5, 5) as winners_water \gset
select test.give_carp(:'lake', 'The Target', 'mirror', 34, 80, 0) as target \gset
select test.give_carp(:'lake', 'A Twenty', 'common', 22, 80, 0) as twenty \gset
insert into public.swims (lake_id, name, position_x, position_y) values (:'lake', 'The Point', 0.2, 0.2) returning id as point \gset

set role service_role;
select public.open_bounty(:'lake', null, null, 'named_fish', 'hard', :'target', 'The Target', 34, 'halcyon', null, 'prototype', 900, 'blackmere', null, 0, 'blackmere-prototype-rod', now() - interval '1 hour', now() + interval '3 hours') as named_bounty \gset
select test.assert_that(public.open_bounty(:'lake', null, null, 'hard_graft', 'easy', null, null, null, 'marlow', null, 'money', 500, null, null, 0, null, now(), now() + interval '2 hours') is null, 'one bounty at a time on a water');
reset role;
select test.assert_that((select count(*) from public.notifications where profile_id = test.player(280) and kind = 'bounty_posted') = 1, 'the owner hears of the sponsor''s bounty');
select test.assert_that((select count(*) from public.world_events where kind = 'bounty_posted' and lake_id = :'lake') = 1, 'and so does the world');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(281)::text, false);
select public.pay_day_ticket(:'lake') as visit \gset
set role service_role;
select public.record_catch(test.player(281), :'visit', :'twenty', 'The Point', 'hair rig', 'boilie', 6, 1, 0.5, 3, 1, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-shelf_life_boilie', 9) as wrong_fish \gset
reset role;
select test.assert_that((select status = 'open' from public.bounties where id = :'named_bounty'), 'the wrong fish does not take a named-fish bounty');
set role service_role;
select public.record_catch(test.player(281), :'visit', :'target', 'The Point', 'hair rig', 'boilie', 6, 1, 0.5, 3, 1, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-shelf_life_boilie', 10) as the_take \gset
reset role;
select test.assert_that((select status = 'won' and winner_id = test.player(281) and winning_catch_id = :'the_take' from public.bounties where id = :'named_bounty'), 'the named fish settles on the spot');
select test.assert_that((select item_id = 'blackmere-prototype-rod-no-1' and holder_id = test.player(281) and not is_destroyed from public.prototypes where bounty_id = :'named_bounty'), 'the prototype is numbered and held');
select test.assert_that((select quantity = 1 from public.tackle_owned where profile_id = test.player(281) and item_id = 'blackmere-prototype-rod-no-1'), 'and in the winner''s tackle box');
select test.assert_that((select count(*) from public.notifications where profile_id = test.player(281) and kind = 'bounty_won') = 1, 'the winner is told');
select test.assert_that((select bounties_taken from public.award_tallies_of(test.player(281))) = 1, 'the bounty counts toward the first-bounty award');

set role service_role;
select public.strike_prototype(test.player(281), 'blackmere-prototype-rod-no-1');
reset role;
select test.assert_that((select is_destroyed and destroyed_at is not null from public.prototypes where item_id = 'blackmere-prototype-rod-no-1'), 'a snapped prototype is struck from the board');
select test.assert_that((select count(*) from public.world_events where kind = 'prototype_lost') = 1, 'and the world hears it snap');

set role service_role;
select public.open_bounty(:'lake', :'point', 'The Point', 'top_of_the_water', 'moderate', null, null, null, 'quarryman', null, 'money', 650, null, null, 0, null, now() - interval '2 hours', now()) as window_bounty \gset
select test.assert_that(public.close_ended_bounties() = 1, 'an ended window bounty is closed by the cron');
reset role;
select test.assert_that((select status = 'won' and winner_id = test.player(281) and winning_catch_id = :'the_take' from public.bounties where id = :'window_bounty'), 'top of the water goes to the heaviest fish in the window');
select test.assert_that(test.money_of(test.player(281)) = 100000 - 20 + 650, 'and the money is paid');

set role service_role;
select public.open_bounty(:'lake', null, null, 'over_the_line', 'very_hard', null, null, 60, 'blackmere', null, 'money', 2000, null, null, 0, null, now() - interval '2 hours', now()) as unclaimed \gset
select public.close_ended_bounties();
reset role;
select test.assert_that((select status = 'unclaimed' from public.bounties where id = :'unclaimed'), 'a line nobody crossed goes unclaimed');

set role service_role;
select public.open_bounty(:'lake', null, null, 'hard_graft', 'easy', null, null, null, 'tench_and_sons', null, 'stocked_fish', 500, null, null, 0, null, now() - interval '2 hours', now()) as graft \gset
select public.close_ended_bounties();
reset role;
select test.assert_that((select count(*) from public.carp where lake_id = :'winners_water' and weight_lb = 30) = 1, 'a stocked-fish prize lands a thirty in the winner''s own water');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(280)::text, false);
select test.assert_refused(format('select public.post_bounty(%L, %L, %L, null, null, 100, now() + interval ''2 hours'')', :'lake', 'hard_graft', 'easy'), 'at least');
select public.post_bounty(:'lake', 'hard_graft', 'easy', null, null, 300, now() + interval '2 hours') as owners_bounty \gset
reset role;
select test.assert_that(test.money_of(test.player(280)) = 100000 + 20 - 300, 'the owner pays for their own bounty');
select test.assert_that((select posted_by = test.player(280) and prize_money = 300 from public.bounties where id = :'owners_bounty'), 'and it is on the water');

set role service_role;
select public.buy_tackle_on_credit(test.player(282), 'marlow-rod-2.75-12', 1, 180, null, 'marlow') as spent \gset
reset role;
select test.assert_that(:spent = 0 and test.money_of(test.player(282)) = 100000 - 180, 'no credit means the pocket pays');
insert into public.tackle_credits (profile_id, brand, amount) values (test.player(282), 'marlow', 100);
set role service_role;
select public.buy_tackle_on_credit(test.player(282), 'marlow-rod-2.75-12', 1, 180, null, 'marlow') as credited \gset
reset role;
select test.assert_that(:credited = 100 and test.money_of(test.player(282)) = 100000 - 180 - 80, 'brand credit is spent first');
