select test.sign_up(220);
select test.sign_up(221);
select test.give_lake(test.player(220), 'Ticket Water', 'uk_ireland', 51.5, -0.5, 5) as water \gset
update public.lakes set day_ticket_fee = 20 where id = :'water';

select test.assert_that((select count(*) from public.ticket_products where lake_id = :'water') = 2, 'a new water is seeded with two tickets');
select test.assert_that((select price from public.ticket_products where lake_id = :'water' and kind = 'twenty_four_hours') = 50, 'the 24-hour ticket seeds at two and a half day tickets');
select id as day_product from public.ticket_products where lake_id = :'water' and kind = 'day' \gset

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(220)::text, false);
insert into public.ticket_products (lake_id, kind, days, price) values (:'water', 'night', 1, 30) returning id as night_product \gset
insert into public.ticket_products (lake_id, kind, days, price) values (:'water', 'multi_day', 3, 45) returning id as long_product \gset

select set_config('request.jwt.claim.sub', test.player(221)::text, false);
select test.assert_refused(format('insert into public.ticket_products (lake_id, kind, days, price) values (%L, %L, 1, 5)', :'water', 'day'), 'row-level security');
select public.buy_ticket(:'water', :'night_product') as night_visit \gset
reset role;
select test.assert_that((select session_from_hour = 19 and session_to_hour = 31 and sessions_left = 1 and fee_paid = 30 from public.lake_visits where id = :'night_visit'), 'a night ticket runs 19:00 to 07:00 and costs its price');
select test.assert_that(test.money_of(test.player(221)) = 100000 - 30 and test.money_of(test.player(220)) = 100000 + 30, 'the fee moves to the owner');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(221)::text, false);
select public.buy_ticket(:'water', :'long_product') as long_visit \gset
select test.assert_refused(format('select public.sit_the_next_session(%L)', :'night_visit'), 'no sessions left');
select public.sit_the_next_session(:'long_visit');
reset role;
select test.assert_that((select sessions_left = 2 and fee_paid = 135 and session_to_hour = 31 from public.lake_visits where id = :'long_visit'), 'a three-day ticket costs three days and sits them one after another');
select test.assert_that((select abs(extract(epoch from (expires_at - (now() + interval '6 hours')))) < 5 from public.lake_visits where id = :'long_visit'), 'a three-day ticket lives six real hours');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(220)::text, false);
select public.pay_day_ticket(:'water') as owner_visit \gset
reset role;
select test.assert_that((select fee_paid = 0 and ticket_product_id = :'day_product' and session_from_hour = 7 and session_to_hour = 19 from public.lake_visits where id = :'owner_visit'), 'the owner walks on to a day ticket for nothing');
select test.assert_that((select from_price from public.lake_summaries where id = :'water') = 20, 'the list shows the cheapest ticket');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(220)::text, false);
update public.ticket_products set is_on_sale = false where id = :'day_product';
select set_config('request.jwt.claim.sub', test.player(221)::text, false);
select test.assert_refused(format('select public.buy_ticket(%L, %L)', :'water', :'day_product'), 'not on sale');
reset role;
