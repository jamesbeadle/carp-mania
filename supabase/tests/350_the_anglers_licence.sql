select test.sign_up(350);
select test.sign_up(351);
select test.assert_that((select licence_signed_at is null from public.profiles where id = test.player(350)), 'a new angler has not signed the licence');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(350)::text, false);
select test.assert_refused($$select public.sign_the_licence('Silt Stalker', '/portrait/1-0-1-2-1-0.svg')$$, 'no spaces');
select test.assert_refused($$select public.sign_the_licence('player351', '/portrait/1-0-1-2-1-0.svg')$$, 'already fishes as');
select test.assert_refused($$select public.sign_the_licence('SiltStalker', 'https://example.com/me.png')$$, 'not one the bank can draw');
select test.assert_refused($$select public.sign_the_licence('SiltStalker', '/portrait/9-0-1-2-1-0.svg')$$, 'not one the bank can draw');
select public.sign_the_licence('SiltStalker', '/portrait/1-0-1-2-1-0.svg');
reset role;

select test.assert_that((select display_name = 'SiltStalker' and avatar_url = '/portrait/1-0-1-2-1-0.svg' and licence_signed_at is not null from public.profiles where id = test.player(350)), 'the licence carries the name and the portrait');
select test.assert_that((select name from public.fishermen where id = (select current_fisherman_id from public.profiles where id = test.player(350))) = 'SiltStalker', 'the fisherman of the day takes the name');

select public.reset_the_game();
select test.assert_that((select licence_signed_at is null and display_name = 'SiltStalker' from public.profiles where id = test.player(350)), 'a reset sends the angler back to sign again, name kept');
