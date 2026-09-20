select test.sign_up(20);
select test.sign_up(21);
select test.give_lake(test.player(20), 'Twenty Acre', 'uk_ireland', 52.2, -1.5, 8);
select test.give_carp(test.lake_of(test.player(20)), 'Fatty', 'mirror', 20, 80, 0);
insert into public.swims (lake_id, name, position_x, position_y) values (test.lake_of(test.player(20)), 'The Peg', 0.1, 0.5);
insert into public.notifications (profile_id, kind, title, body, link) values (test.player(20), 'sold', 'Sold', 'A fish sold.', '/inbox');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(20)::text, false);

select test.assert_that((select count(*) from public.carp where lake_id = test.lake_of(test.player(20))) = 1, 'an owner reads their carp');
select test.assert_refused($$update public.carp set weight_lb = 60 where lake_id = test.lake_of(test.player(20))$$, 'permission denied');
select test.assert_refused($$delete from public.carp where lake_id = test.lake_of(test.player(20))$$, 'permission denied');
select test.assert_refused(
	$$insert into public.carp (lake_id, name, strain, weight_lb, age_years, condition) values (test.lake_of(test.player(20)), 'Minted', 'ghost', 60, 9, 100)$$,
	'permission denied'
);
select test.assert_refused($$update public.swims set name = 'Moved' where lake_id = test.lake_of(test.player(20))$$, 'permission denied');

select test.assert_refused($$update public.lakes set acres = 400 where owner_id = test.player(20)$$, 'permission denied');
select test.assert_refused($$update public.lakes set latitude = 0 where owner_id = test.player(20)$$, 'permission denied');
select test.assert_refused($$update public.lakes set reputation = 100 where owner_id = test.player(20)$$, 'permission denied');
update public.lakes set name = 'Renamed Water', day_ticket_fee = 25, is_public = true where owner_id = test.player(20);
select test.assert_that((select name from public.lakes where owner_id = test.player(20)) = 'Renamed Water', 'an owner renames their lake');

select test.assert_refused($$update public.profiles set money = 1000000 where id = test.player(20)$$, 'permission denied');
select test.assert_refused($$update public.profiles set home_region = 'danube' where id = test.player(20)$$, 'permission denied');
select test.assert_refused($$update public.profiles set watercraft = 100 where id = test.player(20)$$, 'permission denied');
update public.profiles set display_name = 'Twenty', saved_rods = '[{"name": "rod"}]'::jsonb where id = test.player(20);
select test.assert_that((select display_name from public.profiles where id = test.player(20)) = 'Twenty', 'a player renames themselves');

select test.assert_refused(
	$$insert into public.catches (lake_id, angler_name, weight_lb, swim_name, rig, bait, hook_size) values (test.lake_of(test.player(20)), 'Ghost', 50, 'x', 'x', 'x', 4)$$,
	'row-level security'
);
select test.assert_refused(
	$$insert into public.lake_visits (lake_id, angler_name) values (test.lake_of(test.player(20)), 'Ghost')$$,
	'row-level security'
);
select test.assert_refused(
	$$insert into public.carp_transfers (carp_name, kind, price) values ('Minted', 'sale', 1)$$,
	'row-level security'
);
select test.assert_refused($$insert into public.world_events (kind, lake_id) values ('record', test.lake_of(test.player(20)))$$, 'row-level security');
select test.assert_refused(
	$$insert into public.listings (carp_id, lake_id, seller_id, kind, starting_price, listing_fee, ends_at, latest_ends_at)
		select id, lake_id, test.player(20), 'auction', 1, 0, now(), now() from public.carp$$,
	'row-level security'
);

select test.assert_that((select count(*) from public.notifications) = 1, 'a player reads their own inbox');
update public.notifications set read_at = now() where profile_id = test.player(20);
select test.assert_that((select read_at is not null from public.notifications where profile_id = test.player(20)), 'a player marks their inbox read');
select test.assert_refused($$update public.notifications set title = 'Forged' where profile_id = test.player(20)$$, 'permission denied');

insert into public.favourite_lakes (profile_id, lake_id) values (test.player(20), test.lake_of(test.player(20)));
select test.assert_refused(
	$$insert into public.favourite_lakes (profile_id, lake_id) values (test.player(21), test.lake_of(test.player(20)))$$,
	'row-level security'
);

select set_config('request.jwt.claim.sub', test.player(21)::text, false);
update public.lakes set name = 'Stolen' where owner_id = test.player(20);
select test.assert_that((select count(*) from public.notifications) = 0, 'another player sees nothing of that inbox');
select test.assert_that((select count(*) from public.favourite_lakes) = 0, 'favourites are private');
reset role;
select test.assert_that((select name from public.lakes where owner_id = test.player(20)) = 'Renamed Water', 'another player cannot rename it');

select test.give_lake(test.player(21), 'Hidden Pool', 'uk_ireland', 54.5, -3.1, 4) as hidden_pool \gset
update public.lakes set is_public = false where id = :'hidden_pool';
select test.give_carp(:'hidden_pool', 'Secret', 'leather', 22, 85, 0) as secret \gset
set role authenticated;
select set_config('request.jwt.claim.sub', test.player(20)::text, false);
select test.assert_that((select count(*) from public.carp where id = :'secret') = 0, 'a private water''s fish are unseen');
reset role;
