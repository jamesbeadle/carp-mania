select test.sign_up(340);
select test.sign_up(341);

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(340)::text, false);
select test.assert_refused($$select public.create_badge('Bronze Carp', 'A first fish', 'bronze')$$, 'Only the keeper');
reset role;

update public.profiles set is_admin = true where id = test.player(340);
set role authenticated;
select set_config('request.jwt.claim.sub', test.player(340)::text, false);
select public.create_badge('Bronze Carp', 'A first fish on the bank', 'bronze') as bronze \gset
select test.assert_refused($$select public.create_badge('bronze carp', 'Again', 'gold')$$, 'already a badge');
select test.assert_refused($$select public.create_badge('B', 'Too short', 'gold')$$, 'check');
select test.assert_refused($$select public.create_badge('Tin Carp', 'No such metal', 'tin')$$, 'check');
select public.award_badge(:'bronze', test.player(341), 'For the first fish of the season') as pinned \gset
select test.assert_refused('select public.award_badge(''' || :'bronze' || ''', test.player(341), '''')', 'already wear');
reset role;

select test.assert_that((select count(*) from public.badge_awards where badge_id = :'bronze' and profile_id = test.player(341)) = 1, 'the badge is on the angler');
select test.assert_that((select count(*) from public.notifications where profile_id = test.player(341) and kind = 'badge_awarded') = 1, 'and a note went up for them');
select test.assert_that((select awarded_by from public.badge_awards where id = :'pinned') = test.player(340), 'the keeper who pinned it is remembered');
