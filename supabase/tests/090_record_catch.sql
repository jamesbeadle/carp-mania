select test.sign_up(90);
select test.sign_up(91);
select test.sign_up(92);
select test.sign_up(93);
select test.give_lake(test.player(90), 'Record Pit', 'uk_ireland', 51.5, -0.5, 5) as lake \gset
select test.give_lake(test.player(92), 'Lac Record', 'france', 48.8, 2.3, 5) as french_lake \gset
select test.give_lake(test.player(93), 'Private Pit', 'uk_ireland', 53.5, -2.5, 5) as private_lake \gset
update public.lakes set is_public = false where id = :'private_lake';
select test.give_carp(:'lake', 'Twenty', 'common', 20, 80, 0) as twenty \gset
select test.give_carp(:'lake', 'Fifteen', 'common', 15, 80, 0) as fifteen \gset
select test.give_carp(:'lake', 'Thirtytwo', 'mirror', 32, 80, 0) as thirtytwo \gset
select test.give_carp(:'lake', 'Hidden', 'common', 18, 80, 0) as hidden \gset
select test.give_carp(:'lake', 'Travelling', 'common', 18, 80, 0) as travelling \gset
select test.give_carp(:'french_lake', 'Etranger', 'common', 18, 80, 0) as foreign_fish \gset
update public.carp set is_catalogued = false where id = :'hidden';
update public.carp set transit_until = now() + interval '1 hour' where id = :'travelling';
insert into public.catches (lake_id, angler_name, weight_lb, swim_name, rig, bait, hook_size) values
	(:'french_lake', 'Jean', 40, 'La Pointe', 'hair', 'boilie', 4),
	(:'private_lake', 'Bob', 35, 'The Peg', 'hair', 'boilie', 4);

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(91)::text, false);
select test.assert_refused(format('select public.pay_day_ticket(%L)', :'private_lake'), 'not open to anglers');
select public.pay_day_ticket(:'lake') as visit \gset
select test.assert_that((select seed between 0 and 2147483647 from public.lake_visits where id = :'visit'), 'a visit carries its seed');
select test.assert_that(test.money_of(test.player(91)) = 99980 and test.money_of(test.player(90)) = 100020, 'the day ticket changes hands');
select test.assert_refused(
	format('select public.record_catch(%L, %L, %L, %L, %L, %L, 6, 1, 1, 1, 1)', test.player(91), :'visit', :'twenty', 'The Peg', 'hair rig', 'boilie'),
	'permission denied for function record_catch'
);
select set_config('request.jwt.claim.sub', test.player(93)::text, false);
select public.pay_day_ticket(:'private_lake') as own_visit \gset
select test.assert_that((select fee_paid = 0 from public.lake_visits where id = :'own_visit'), 'an owner fishes their own private water for nothing');

set role service_role;
select public.record_catch(test.player(91), :'visit', :'twenty', 'The Peg', 'hair rig', 'boilie', 6, 1, 0.5, 3, 1) as first_catch \gset
reset role;
select test.assert_that((select angler_id = test.player(91) and weight_lb = 20 and angler_name = 'Player 91' from public.catches where id = :'first_catch'), 'the catch is the angler''s');
select test.assert_that((select fame = 15 and times_caught = 1 from public.carp where id = :'twenty'), 'fame: 3 for a player, 10 for the lake record, 2 for a personal best');
select test.assert_that(
	(select line_selection = 26 and rig_selection = 25.5 and bait_selection = 27 and watercraft = 26 and experience = 1 from public.profiles where id = test.player(91)),
	'skills grow by at most 2 a catch'
);
select test.assert_that((select fish_caught from public.lake_visits where id = :'visit') = 1, 'the visit counts the fish');
select test.assert_that((select reputation > 20 from public.lakes where id = :'lake'), 'the water''s reputation grows');
select test.assert_that(
	(select count(*) from public.world_events where lake_id = :'lake' and kind = 'record' and payload ->> 'scope' = 'lake' and payload ->> 'fishName' = 'Twenty') = 1,
	'a lake record is news'
);
select test.assert_that((select count(*) from public.world_events where lake_id = :'lake' and kind = 'big_catch') = 0, 'a twenty is not a big catch');
select test.assert_that((select count(*) from public.notifications where profile_id = test.player(90) and kind = 'record_set') = 1, 'the owner hears of the record');

set role service_role;
select public.record_catch(test.player(91), :'visit', :'fifteen', 'The Peg', 'hair rig', 'boilie', 6, 0, 0, 0, 0);
select public.record_catch(test.player(91), :'visit', :'thirtytwo', 'The Peg', 'hair rig', 'boilie', 6, 0, 0, 0, 0);
select public.record_catch(test.player(91), :'visit', :'hidden', 'The Peg', 'hair rig', 'boilie', 6, 0, 0, 0, 0);
reset role;
select test.assert_that((select fame from public.carp where id = :'fifteen') = 3, 'an ordinary catch is worth 3');
select test.assert_that((select fame from public.carp where id = :'thirtytwo') = 15, 'a new lake record and personal best, but not the region record of 35');
select test.assert_that((select fame = 3 and is_catalogued from public.carp where id = :'hidden'), 'an unknown original is catalogued on its first capture');
select test.assert_that((select count(*) from public.world_events where lake_id = :'lake' and kind = 'record') = 2, 'two records set on the water');
select test.assert_that(
	(select count(*) from public.world_events where lake_id = :'lake' and kind = 'big_catch' and payload ->> 'anglerName' = 'Player 91' and (payload ->> 'weightLb')::numeric = 32) = 1,
	'a thirty by a player is a big catch'
);
select test.assert_that((select count(*) from public.notifications where profile_id = test.player(90) and kind = 'big_catch_on_your_water') = 1, 'the owner hears of the thirty');
select test.assert_that((select count(*) from public.notifications where profile_id = test.player(90) and kind = 'record_set') = 2, 'and of both records');
select test.assert_that((select count(*) from public.world_events where kind = 'record' and payload ->> 'scope' <> 'lake') = 0, 'no region or world records were claimed');
update public.carp set weight_lb = 33 where id = :'thirtytwo';
set role service_role;
select public.record_catch(test.player(91), :'visit', :'thirtytwo', 'The Peg', 'hair rig', 'boilie', 6, 0, 0, 0, 0);
reset role;
select test.assert_that((select fame from public.carp where id = :'thirtytwo') = 15 + 13, 'a grown fish is a lake record again, but a personal best only once per angler');

set role service_role;
select test.assert_refused(format('select public.record_catch(%L, %L, %L, %L, %L, %L, 6, 0, 0, 0, 0)', test.player(90), :'visit', :'twenty', 'x', 'x', 'x'), 'No day ticket');
select test.assert_refused(format('select public.record_catch(%L, %L, %L, %L, %L, %L, 6, 0, 0, 0, 0)', test.player(91), :'visit', :'foreign_fish', 'x', 'x', 'x'), 'not in this lake');
select test.assert_refused(format('select public.record_catch(%L, %L, %L, %L, %L, %L, 6, 0, 0, 0, 0)', test.player(91), :'visit', :'travelling', 'x', 'x', 'x'), 'cannot be fished for yet');
reset role;
select test.assert_that((select count(*) from pg_proc where proname = 'record_catch') = 1, 'the old record_catch that trusted the client is gone');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(91)::text, false);
select test.assert_that(
	(select heaviest_lb = 33 and anglers_on_bank_now = 1 and listing_count = 0 and owner_name = 'Player 90' and region = 'uk_ireland' from public.world_pins where id = :'lake'),
	'the globe shows the water, its best fish and the angler on the bank'
);
select test.assert_that((select count(*) from public.world_pins where id = :'private_lake') = 0, 'a private water is not on the globe');
select test.assert_that((select count(*) from public.world_pins where id = test.lake_of(test.player(1))) = 0, 'an unpinned water is not on the globe');
reset role;

select test.give_carp(:'private_lake', 'Secret', 'leather', 22, 85, 0) as secret \gset
set role authenticated;
select set_config('request.jwt.claim.sub', test.player(91)::text, false);
select test.assert_that((select count(*) from public.carp where id = :'secret') = 0, 'a private water''s fish are unseen');
select set_config('request.jwt.claim.sub', test.player(93)::text, false);
select public.list_carp_for_sale(:'secret', 'auction', 500, null, null, 48);
select set_config('request.jwt.claim.sub', test.player(91)::text, false);
select test.assert_that((select count(*) from public.carp where id = :'secret') = 1, 'until it is up for sale');
reset role;
