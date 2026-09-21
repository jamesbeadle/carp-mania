select test.sign_up(300);
select test.sign_up(301);
select test.give_lake(test.player(300), 'Sponsored Water', 'uk_ireland', 51.5, -0.5, 5) as water \gset
insert into public.lake_sponsorship_offers (id, lake_id, brand, term_months, amount, expires_at)
values ('00000000-0000-0000-0000-000000000301', :'water', 'marlow', 12, 9000, now() + interval '30 hours'),
	('00000000-0000-0000-0000-000000000302', :'water', 'quarryman', 6, 4000, now() + interval '30 hours'),
	('00000000-0000-0000-0000-000000000303', :'water', 'halcyon', 6, 5000, now() - interval '1 hour');
select test.money_of(test.player(300)) as money_before \gset

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(301)::text, false);
select test.assert_refused($$select public.accept_lake_sponsorship('00000000-0000-0000-0000-000000000301')$$, 'Only the owner can sign');
select test.assert_refused($$select public.reject_lake_sponsorship('00000000-0000-0000-0000-000000000302')$$, 'Only the owner can turn an offer down');
select set_config('request.jwt.claim.sub', test.player(300)::text, false);
select test.assert_refused($$select public.accept_lake_sponsorship('00000000-0000-0000-0000-000000000303')$$, 'lapsed');
select public.accept_lake_sponsorship('00000000-0000-0000-0000-000000000301') as deal \gset
reset role;

select test.assert_that(test.money_of(test.player(300)) - :'money_before' = 9000, 'the lump sum lands when the owner signs');
select test.assert_that((select status from public.lake_sponsorship_offers where id = '00000000-0000-0000-0000-000000000301') = 'accepted', 'the offer is accepted');
select test.assert_that((select status from public.lake_sponsorship_offers where id = '00000000-0000-0000-0000-000000000302') = 'superseded', 'the other open offer lapses');
select test.assert_that((select sponsor_brand from public.lakes where id = :'water') = 'marlow', 'the boards carry the sponsor');
select test.assert_that((select runs_until - runs_from from public.lake_sponsorships where id = :'deal') = interval '360 hours', 'a year on the boards is twelve fishery months of thirty days');
