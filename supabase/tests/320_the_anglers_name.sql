select test.sign_up(320);
select test.sign_up(321);
select test.assert_that((select display_name from public.profiles where id = test.player(320)) = 'Player320', 'a new angler starts as a first name');
select test.assert_that(public.angler_name_of_first_name('James Beadle') = 'James', 'the first name is taken from the full name');
select test.assert_that(public.angler_name_of_first_name('Al Bloggs') = 'Angler', 'a first name too short becomes Angler');
select test.assert_that(public.angler_name_of_first_name('Jean-Luc P') = 'JeanLuc', 'punctuation is dropped');

select test.give_lake(test.player(320), 'Name Water', 'uk_ireland', 51.5, -0.5, 5) as water \gset
select test.give_carp(:'water', 'Named', 'common', 26, 80, 0) as fish \gset
set role authenticated;
select set_config('request.jwt.claim.sub', test.player(321)::text, false);
select public.pay_day_ticket(:'water') as visit \gset
set role service_role;
select public.record_catch(test.player(321), :'visit', :'fish', 'The Peg', 'hair rig', 'boilie', 6, 0, 0, 0, 0, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-shelf_life_boilie') as catch \gset
reset role;

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(321)::text, false);
select test.assert_refused($$select public.rename_angler('Carp Dad')$$, 'no spaces');
select test.assert_refused($$select public.rename_angler('Cd')$$, '3–24 letters');
select test.assert_refused($$select public.rename_angler('player320')$$, 'already fishes as');
select public.rename_angler('CarpDad');
reset role;
select test.assert_that((select display_name from public.profiles where id = test.player(321)) = 'CarpDad', 'the angler fishes under the new name');
select test.assert_that((select name from public.fishermen where id = (select current_fisherman_id from public.profiles where id = test.player(321))) = 'CarpDad', 'and so does the fisherman of the day');
select test.assert_that((select angler_name from public.catches where id = :'catch') = 'CarpDad', 'the catch follows the name');
select test.assert_that((select angler_name from public.lake_visits where id = :'visit') = 'CarpDad', 'the visit follows the name');
select test.assert_that((select count(*) from public.world_events where payload ->> 'anglerId' = test.player(321)::text and payload ->> 'anglerName' <> 'CarpDad') = 0, 'the news follows the name');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(320)::text, false);
select public.rename_angler('Owner320');
reset role;
select test.assert_that((select owner_name from public.catches where id = :'catch') = 'Owner320', 'the owner''s name on the catch follows too');
select test.assert_refused($$update public.profiles set display_name = 'carpdad' where id = test.player(320)$$, 'profiles_one_angler_per_name');
