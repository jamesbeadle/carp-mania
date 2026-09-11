select test.sign_up(10);
select test.assert_that(test.money_of(test.player(10)) = 100000, 'a new player starts with £100,000');
select test.assert_that((select display_name from public.profiles where id = test.player(10)) = 'Player 10', 'the trigger names the profile');
select test.assert_that((select home_region from public.profiles where id = test.player(10)) is null, 'a new player has not chosen a region yet');

select test.assert_that(test.money_of(test.player(1)) = 99200, 'the grandfathered player got £95,000 on top of what they held');
select test.assert_that((select home_region from public.profiles where id = test.player(1)) = 'uk_ireland', 'a grandfathered player is at home in the UK');

set role service_role;
select test.give_lake(test.player(10), 'Ten Acre Pit', 'uk_ireland', 51.5074, -0.1278, 5);
reset role;
select test.assert_that((select region from public.lakes where owner_id = test.player(10)) = 'uk_ireland', 'the service role can create a lake');
select test.assert_that((select is_setup_complete from public.lakes where owner_id = test.player(10)), 'a lake is set up unless told otherwise');

select test.assert_refused($$update public.profiles set money = -1 where id = test.player(10)$$, 'profiles_money_never_negative');
