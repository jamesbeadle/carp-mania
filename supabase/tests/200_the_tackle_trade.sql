select test.sign_up(200);
select test.give_lake(test.player(200), 'Tackle Water', 'uk_ireland', 52.3, -1.3, 5) as lake \gset
select test.give_carp(:'lake', 'Tackle Fish', 'mirror', 18, 85, 0) as fish \gset
insert into public.swims (lake_id, name, position_x, position_y) values (:'lake', 'Peg 1', 0.2, 0.2);

select test.assert_that((select quantity = 3 from public.tackle_owned where profile_id = test.player(200) and item_id = 'bankside_basics-rod-2.75-12'), 'a new angler is given three starter rods');
select test.assert_that((select quantity = 300 from public.tackle_owned where profile_id = test.player(200) and item_id = 'meadowmill-bait-fishmeal_boilie'), 'and a bag of bait');

select public.buy_tackle(test.player(200), 'marlow-rod-3-12', 1, 216, null);
select test.assert_that(test.money_of(test.player(200)) = 100000 - 216, 'buying a rod costs its price');
select test.assert_that((select quantity = 1 from public.tackle_owned where profile_id = test.player(200) and item_id = 'marlow-rod-3-12'), 'and the rod is in the box');
select test.assert_refused(format('select public.buy_tackle(%L, %L, 1, 999999, null)', test.player(200), 'blackmere-rod-3.5-13'), 'costs');

select public.use_tackle(test.player(200), 'bankside_basics-rig-hair_lead_clip', 4);
select test.assert_that((select quantity = 6 from public.tackle_owned where profile_id = test.player(200) and item_id = 'bankside_basics-rig-hair_lead_clip'), 'losing rigs takes them out of the box');
select public.use_tackle(test.player(200), 'bankside_basics-rig-hair_lead_clip', 40);
select test.assert_that((select quantity = 0 from public.tackle_owned where profile_id = test.player(200) and item_id = 'bankside_basics-rig-hair_lead_clip'), 'and never below nothing');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(200)::text, false);
select test.assert_refused(format('select public.buy_tackle(%L, %L, 1, 1, null)', test.player(200), 'marlow-rod-3-12'), 'permission denied');
select public.pay_day_ticket(:'lake') as visit \gset
reset role;
select public.record_catch(test.player(200), :'visit', :'fish', 'Peg 1', 'hair_lead_clip', 'fishmeal_boilie', 4, 0, 0, 0, 0, 'marlow-rod-3-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-fishmeal_boilie') as caught \gset
select test.assert_that((select rod_item_id = 'marlow-rod-3-12' and reel_item_id = 'bankside_basics-reel-carp_large' from public.catches where id = :'caught'), 'a catch remembers the rod and reel that landed it');
select test.assert_that((select quantity = 299 from public.tackle_owned where profile_id = test.player(200) and item_id = 'meadowmill-bait-fishmeal_boilie'), 'a catch uses a bait');
