select test.sign_up(240);
select test.sign_up(241);
select test.give_lake(test.player(240), 'Bailiff Water', 'uk_ireland', 51.5, -0.5, 20) as water \gset
select test.give_lake(test.player(241), 'Next Door', 'uk_ireland', 51.6, -0.4, 5) as next_door \gset

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(240)::text, false);
select public.hire_bailiff(:'water', 'Alan Ashcroft', 42, 75, 70) as first \gset
select public.hire_bailiff(:'water', 'Barry Bailey', 38, 55, 70) as second \gset
select test.assert_refused(format('select public.hire_bailiff(%L, %L, 40, 60, 70)', :'water', 'Colin Coombes'), 'team is full');
reset role;
select test.assert_that((select count(*) from public.bailiffs where lake_id = :'water') = 2, 'twenty acres keeps two bailiffs');
select test.assert_that((select has_bailiff from public.lakes where id = :'water'), 'the flag follows the team');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(241)::text, false);
select test.assert_refused(format('select public.hire_bailiff(%L, %L, 40, 60, 70)', :'water', 'Sneaky'), 'not your water');
select test.assert_refused(format('select public.sack_bailiff(%L, %L)', :'water', :'first'), 'not your water');
select test.assert_that((select count(*) from public.bailiffs where lake_id = :'water') = 0, 'another owner cannot see the team');
select set_config('request.jwt.claim.sub', test.player(240)::text, false);
select public.sack_bailiff(:'water', :'first');
select public.sack_bailiff(:'water', :'second');
select test.assert_refused(format('select public.sack_bailiff(%L, %L)', :'water', :'first'), 'No such bailiff');
reset role;
select test.assert_that((select not has_bailiff from public.lakes where id = :'water'), 'with the team gone the flag drops');
