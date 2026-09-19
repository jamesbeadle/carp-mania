select test.sign_up(260);
select test.sign_up(261);
select test.sign_up(262);
select test.give_lake(test.player(260), 'Booked Water', 'uk_ireland', 51.5, -0.5, 5) as water \gset
insert into public.swims (lake_id, name, position_x, position_y) values (:'water', 'Only Peg', 0.1, 0.1) returning id as peg \gset
select id as day_product from public.ticket_products where lake_id = :'water' and kind = 'day' \gset

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(261)::text, false);
select test.assert_refused(format('select public.book_a_peg(%L, %L, %L, public.fishery_day_now())', :'water', :'peg', :'day_product'), 'walk-on');
select set_config('request.jwt.claim.sub', test.player(260)::text, false);
select public.set_booking_on(:'water', true);
select set_config('request.jwt.claim.sub', test.player(261)::text, false);
select public.book_a_peg(:'water', :'peg', :'day_product', public.fishery_day_now()) as booking \gset
select test.assert_refused(format('select public.book_a_peg(%L, %L, %L, public.fishery_day_now())', :'water', :'peg', :'day_product'), 'booked that day');
reset role;
select test.assert_that(test.money_of(test.player(261)) = 100000 - 20 and test.money_of(test.player(260)) = 100000 + 20, 'the booking is paid now');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(262)::text, false);
select test.assert_refused(format('select public.buy_ticket(%L, %L)', :'water', :'day_product'), 'Every peg is booked today');
select set_config('request.jwt.claim.sub', test.player(261)::text, false);
select public.buy_ticket(:'water', :'day_product') as visit \gset
reset role;
select test.assert_that((select fee_paid = 0 from public.lake_visits where id = :'visit'), 'the booked angler walks on without paying twice');
select test.assert_that((select status = 'fished' from public.bookings where id = :'booking'), 'the booking is used');

set role authenticated;
select set_config('request.jwt.claim.sub', test.player(260)::text, false);
select public.sell_syndicate_places(:'water', 2, 400);
select set_config('request.jwt.claim.sub', test.player(262)::text, false);
select test.assert_refused(format('select public.buy_ticket(%L, %L)', :'water', :'day_product'), 'syndicate water');
select public.buy_syndicate_place(:'water');
select test.assert_refused(format('select public.buy_syndicate_place(%L)', :'water'), 'already in the syndicate');
select public.buy_ticket(:'water', :'day_product') as member_visit \gset
reset role;
select test.assert_that((select fee_paid = 0 from public.lake_visits where id = :'member_visit'), 'a member fishes free');
select test.assert_that((select syndicate_places_for_sale from public.lakes where id = :'water') = 1, 'one place left');
select test.assert_that(test.money_of(test.player(262)) = 100000 - 400, 'the place is paid for');
