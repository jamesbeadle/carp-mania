select test.sign_up(290);
select test.sign_up(291);
select test.give_lake(test.player(290), 'Frozen Water', 'uk_ireland', 51.5, -0.5, 5) as water \gset
select test.give_carp(:'water', 'Old Timer', 'common', 24, 80, 0) as old_timer \gset
insert into public.lake_species (lake_id, species, count) values (:'water', 'bream', 30) on conflict (lake_id, species) do update set count = 30;

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(291)::text, false);
select public.pay_day_ticket(:'water') as visit \gset
reset role;
select test.assert_that((select water_as_found -> 'lake' ->> 'name' = 'Frozen Water' from public.lake_visits where id = :'visit'), 'the visit freezes the lake as the angler found it');
select test.assert_that((select jsonb_array_length(water_as_found -> 'carp') = 1 and water_as_found -> 'carp' -> 0 ->> 'name' = 'Old Timer' from public.lake_visits where id = :'visit'), 'the visit freezes the carp as found');
select test.assert_that((select (select (kind ->> 'count')::integer from jsonb_array_elements(water_as_found -> 'species') as kind where kind ->> 'species' = 'bream') = 30 and jsonb_array_length(water_as_found -> 'shoals') = 1 from public.lake_visits where id = :'visit'), 'the visit freezes the species and the shoals');
select test.assert_that((select (skills_at_start ->> 'watercraft')::numeric = 25 from public.lake_visits where id = :'visit'), 'the visit freezes the angler''s skills at the start');

set role service_role;
select public.record_catch(test.player(291), :'visit', :'old_timer', 'The Peg', 'hair rig', 'boilie', 6, 1, 1, 1, 2, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-shelf_life_boilie') as first_catch \gset
reset role;
select test.give_carp(:'water', 'Newcomer', 'mirror', 30, 80, 0) as newcomer \gset
select test.assert_that((select watercraft = 27 from public.profiles where id = test.player(291)), 'the catch grows the angler''s skills');
select test.assert_that((select (skills_at_start ->> 'watercraft')::numeric = 25 and jsonb_array_length(water_as_found -> 'carp') = 1 from public.lake_visits where id = :'visit'), 'what the visit froze stays as it was through the day');

update public.lake_visits set sessions_left = 2, expires_at = now() + interval '4 hours' where id = :'visit';
set role authenticated;
select set_config('request.jwt.claim.sub', test.player(291)::text, false);
select public.sit_the_next_session(:'visit');
reset role;
select test.assert_that((select (skills_at_start ->> 'watercraft')::numeric = 27 and jsonb_array_length(water_as_found -> 'carp') = 2 from public.lake_visits where id = :'visit'), 'the next session freezes the water and the skills afresh');

set role service_role;
insert into public.lake_visits (lake_id, angler_id, angler_name, fee_paid) values (:'water', null, 'A simulated visitor', 20);
reset role;
select test.assert_that((select water_as_found is null from public.lake_visits where lake_id = :'water' and angler_id is null), 'a simulated visit freezes nothing');
