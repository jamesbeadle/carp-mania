select test.sign_up(250);
select test.sign_up(251);
select test.give_lake(test.player(250), 'Make Up Water', 'uk_ireland', 51.5, -0.5, 10) as water \gset
select test.assert_that((select count from public.lake_species where lake_id = :'water' and species = 'tench') = 30, 'a gravel pit comes with thirty tench');
delete from public.lake_species where lake_id = :'water';
select public.seed_species(:'water', 'clay_pit');
select test.assert_that((select count from public.lake_species where lake_id = :'water' and species = 'bream') = 300, 'a clay pit comes with three hundred bream');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(250)::text, false);
select public.stock_coarse_fish(:'water', 'tench', 40, 320);
reset role;
select test.assert_that((select count from public.lake_species where lake_id = :'water' and species = 'tench') = 40, 'tench are stocked');
select test.assert_that(test.money_of(test.player(250)) = 100000 - 320, 'and paid for');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(251)::text, false);
select test.assert_refused(format('select public.net_the_silvers(%L, 9000, 0.6, 8)', :'water'), 'not your water');
select set_config('request.jwt.claim.sub', test.player(250)::text, false);
select public.net_the_silvers(:'water', 9000, 0.6, 8) as taken \gset
reset role;
select test.assert_that(:taken = 180 + 120 + 24, 'netting takes sixty per cent of the bream, roach and tench');
select test.assert_that((select count from public.lake_species where lake_id = :'water' and species = 'bream') = 120, 'a hundred and twenty bream are left');
select test.assert_that((select disturbance from public.lakes where id = :'water') = 8, 'the water is stirred up');
select test.assert_that(test.money_of(test.player(250)) = 100000 - 320 - 9000, 'the netting crew is paid');
