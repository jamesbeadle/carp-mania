select test.sign_up(310);
select test.sign_up(311);
select test.give_lake(test.player(310), 'Thin Water', 'uk_ireland', 51.5, -0.5, 5) as water \gset
select test.give_carp(:'water', 'Lonely', 'common', 22, 80, 0) as lonely \gset
select test.assert_that(public.fish_in_the_water(:'water') = 101, 'every fish in the water counts, shoal fish included');

update public.carp_shoals set count = 90 where lake_id = :'water';
select test.assert_that(public.fish_in_the_water(:'water') = 91, 'the count follows the shoals');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(311)::text, false);
select test.assert_refused(format('select public.pay_day_ticket(%L)', :'water'), '9 more fish are needed');
select set_config('request.jwt.claim.sub', test.player(310)::text, false);
select test.assert_refused(format('select public.pay_day_ticket(%L)', :'water'), 'Closed for restocking');
reset role;
select test.assert_that((select count(*) from public.lake_visits where lake_id = :'water') = 0, 'nobody fishes a water under a hundred fish, its owner included');

insert into public.carp_shoals (lake_id, size_band, count, average_weight_lb, weight_spread_lb, age_years, condition, origin, transit_until)
values (:'water', 'singles', 50, 5, 1, 2, 80, 'farm', now() + interval '2 days');
select test.assert_that(public.fish_in_the_water(:'water') = 91, 'fish on the lorry are not in the water yet');
update public.carp_shoals set transit_until = null where lake_id = :'water' and transit_until is not null;
select test.assert_that(public.fish_in_the_water(:'water') = 141, 'and count once they arrive');
select test.assert_that((select carp_count from public.lake_summaries where id = :'water') = 141, 'the listing shows the same count');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(311)::text, false);
select public.pay_day_ticket(:'water') as visit \gset
reset role;
select test.assert_that((select count(*) from public.lake_visits where lake_id = :'water') = 1, 'restocked, the water sells tickets again');
