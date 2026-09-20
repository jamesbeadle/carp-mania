select test.sign_up(190);
select test.sign_up(191);
select test.give_lake(test.player(190), 'Rating Water', 'uk_ireland', 52.2, -1.2, 5) as lake \gset
select test.give_carp(:'lake', 'A Twenty-Nine', 'mirror', 29, 85, 0) as fish \gset
insert into public.swims (lake_id, name, position_x, position_y) values (:'lake', 'Peg 1', 0.2, 0.2);
update public.profiles set line_selection = 100, rig_selection = 100, bait_selection = 100, watercraft = 100 where id = test.player(191);

select test.assert_that((select public.angler_craft(test.player(191)) = 100), 'four maxed skills make a craft of 100');
select test.assert_that((select public.angler_pedigree(test.player(191)) = 0), 'no fish landed is no pedigree');
select test.assert_that((select public.angler_rating(test.player(191)) = 0), 'a rating is the lesser of craft and pedigree, so maxed skills alone read 0');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(191)::text, false);
select public.pay_day_ticket(:'lake') as visit \gset
reset role;
select public.record_catch(test.player(191), :'visit', :'fish', 'Peg 1', 'ronnie', 'pop_up', 4, 0, 0, 0, 0, 'bankside_basics-rod-2.75-12', 'bankside_basics-reel-carp_large', 'meadowmill-bait-shelf_life_boilie');

select test.assert_that((select public.angler_pedigree(test.player(191)) = 58), 'a twenty-nine is a pedigree of 58');
select test.assert_that((select public.angler_rating(test.player(191)) = 58), 'so a maxed angler with a twenty-nine reads 58');
select test.assert_that((select rating = 58 from public.angler_summaries where id = test.player(191)), 'the summary carries the same rating');
select test.assert_that((select skill_rank = 1 from public.angler_ranks(test.player(191))), 'the rank by rating reads the same number');

update public.catches set weight_lb = 55 where carp_id = :'fish';
select test.assert_that((select public.angler_pedigree(test.player(191)) = 100), 'pedigree is capped at a fifty');
