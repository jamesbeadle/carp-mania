-- Matches and bounties are gone, history and all: no money can pass from one player to another.

create or replace function public.buy_ticket(lake uuid, product uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	largest_seed constant bigint := 2147483647;
	session_life constant interval := interval '2 hours';
	the_lake public.lakes;
	the_product public.ticket_products;
	booking public.bookings;
	fee numeric;
	angler_name text;
	visit_id uuid;
begin
	select * into the_lake from public.lakes where id = lake and ((is_public and is_setup_complete) or owner_id = auth.uid());
	if the_lake.id is null then raise exception 'That lake is not open to anglers'; end if;
	select * into the_product from public.ticket_products where id = product and lake_id = lake and is_on_sale;
	if the_product.id is null then raise exception 'That ticket is not on sale here'; end if;
	fee := the_product.price * the_product.days;
	select * into booking from public.bookings where lake_id = lake and angler_id = auth.uid() and fishery_day = public.fishery_day_now() and status = 'booked' limit 1;
	if the_lake.is_booking_on and booking.id is null and the_lake.owner_id <> auth.uid() then
		if (select count(*) from public.swims where lake_id = lake) - (select count(*) from public.bookings where lake_id = lake and fishery_day = public.fishery_day_now() and status = 'booked') <= 0 then
			raise exception 'Every peg is booked today; book a peg for another day';
		end if;
	end if;
	if public.is_syndicate_water(lake) and the_lake.owner_id <> auth.uid() and not public.is_syndicate_member(lake, auth.uid()) then
		raise exception 'This is a syndicate water; it sells no day tickets';
	end if;
	if the_lake.owner_id = auth.uid() or booking.id is not null or public.is_syndicate_member(lake, auth.uid()) then fee := 0; end if;
	perform public.debit_money(auth.uid(), fee, 'The ticket');
	perform public.credit_money(the_lake.owner_id, fee);
	if booking.id is not null then update public.bookings set status = 'fished' where id = booking.id; end if;
	select display_name into angler_name from public.profiles where id = auth.uid();
	insert into public.lake_visits (lake_id, angler_id, angler_name, fee_paid, seed, ticket_product_id, session_from_hour, session_to_hour, sessions_left, expires_at)
	values (lake, auth.uid(), angler_name, fee, floor(random() * largest_seed)::bigint, the_product.id,
		public.ticket_window_from(the_product.kind), public.ticket_window_to(the_product.kind), the_product.days, now() + session_life * the_product.days)
	returning id into visit_id;
	return visit_id;
end;
$$;

create or replace function public.record_catch(
	angler uuid, visit uuid, fish uuid, swim_name text, rig text, bait text, hook_size integer,
	line_gain numeric, rig_gain numeric, bait_gain numeric, watercraft_gain numeric,
	rod_item text, reel_item text, bait_item text, hour_of_day integer default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
	day_ticket_life constant interval := interval '2 hours';
	bait_per_catch constant numeric := 1;
	lake uuid;
	visit_started timestamptz;
	the_carp public.carp;
	angler_name text;
	owner_name text;
	fisherman uuid;
	broken record;
	catch_id uuid;
begin
	select lake_id, visited_at into lake, visit_started from public.lake_visits where id = visit and angler_id = angler for update;
	if lake is null then raise exception 'No day ticket for this visit'; end if;
	if visit_started < now() - day_ticket_life then raise exception 'That day ticket has expired'; end if;
	select * into the_carp from public.carp where id = fish and lake_id = lake for update;
	if the_carp.id is null then raise exception 'That carp is not in this lake'; end if;
	if the_carp.transit_until is not null or the_carp.quarantine_until is not null then
		raise exception 'That carp cannot be fished for yet';
	end if;
	perform public.assert_not_yet_caught_this_visit(angler, lake, fish, visit_started);
	select display_name into angler_name from public.profiles where id = angler;
	if angler_name is null then raise exception 'No angler is signed in'; end if;
	select owner.display_name into owner_name from public.lakes as water join public.profiles as owner on owner.id = water.owner_id where water.id = lake;
	select current_fisherman_id into fisherman from public.profiles where id = angler;
	select * into broken from public.records_broken_by(lake, angler, fish, the_carp.weight_lb);

	insert into public.catches (lake_id, carp_id, angler_id, angler_name, owner_name, fisherman_id, weight_lb, swim_name, rig, bait, hook_size, rod_item_id, reel_item_id, hour_of_day, visit_id)
	values (lake, fish, angler, angler_name, owner_name, fisherman, the_carp.weight_lb, swim_name, rig, bait, hook_size, rod_item, reel_item, hour_of_day, visit) returning id into catch_id;
	perform public.use_tackle(angler, bait_item, bait_per_catch);
	update public.carp set
		times_caught = times_caught + 1,
		is_catalogued = true,
		fame = fame + public.fame_for_player_catch(broken.is_lake_record, broken.is_region_record, broken.is_world_record, broken.is_personal_best)
	where id = fish;
	update public.lake_visits set fish_caught = fish_caught + 1 where id = visit;
	perform public.grow_reputation_for_catch(lake, the_carp.weight_lb);
	perform public.improve_skills(angler, line_gain, rig_gain, bait_gain, watercraft_gain);
	perform public.raise_catch_news(lake, fish, the_carp.name, the_carp.weight_lb, angler, angler_name,
		public.record_scope_of(broken.is_lake_record, broken.is_region_record, broken.is_world_record));
	perform public.tell_the_beaten(catch_id);
	return catch_id;
end;
$$;

drop function public.award_tallies_of(uuid);
create function public.award_tallies_of(angler uuid)
returns table (
	best_lb numeric, fish_landed integer, regions_fished integer, home_grown_best_lb numeric, light_rod_best_lb numeric,
	records_set integer, record_waters integer, lifetime_lb numeric, night_fish integer, morning_fish integer, ticket_kinds_fished integer,
	fish_sold integer
)
language sql stable security definer set search_path = public as $$
	with mine as (
		select caught.*, water.region, water.owner_id from public.catches as caught join public.lakes as water on water.id = caught.lake_id where caught.angler_id = angler
	),
	light_rod as (select max(weight_lb) as best from mine where rod_item_id like '%-rod-2.75-%'),
	tickets as (
		select count(distinct product.kind)::integer as kinds from mine
		join public.lake_visits as visit on visit.id = mine.visit_id join public.ticket_products as product on product.id = visit.ticket_product_id
		where product.kind in ('day', 'night', 'twenty_four_hours')
	),
	sold as (
		select coalesce(sum(coalesce(head_count, 1)), 0)::integer as fish from public.carp_transfers as moved join public.lakes as water on water.id = moved.from_lake_id
		where water.owner_id = angler and moved.kind in ('sale', 'dealer_purchase')
	)
	select
		coalesce((select max(weight_lb) from mine), 0),
		(select count(*)::integer from mine),
		(select count(distinct region)::integer from mine),
		coalesce((select max(weight_lb) from mine where owner_id = angler), 0),
		coalesce((select best from light_rod), 0),
		(select count(*)::integer from public.milestones_of(angler) where kind = 'first_record' and reached_at is not null),
		(select count(*)::integer from public.records_held_by(angler) where scope = 'lake'),
		coalesce((select sum(weight_lb) from mine), 0),
		(select count(*)::integer from mine where hour_of_day is not null and (hour_of_day >= 21 or hour_of_day < 5)),
		(select count(*)::integer from mine where hour_of_day is not null and hour_of_day >= 5 and hour_of_day < 8),
		(select kinds from tickets),
		(select fish from sold);
$$;
grant execute on function public.award_tallies_of(uuid) to authenticated;

create or replace function public.milestones_of(angler uuid)
returns table (kind text, reached_at timestamptz)
language sql stable security invoker as $$
	with mine as (select caught.weight_lb, caught.caught_at, caught.lake_id from public.catches as caught where caught.angler_id = angler),
	weights as (select * from (values ('twenty', 20), ('thirty', 30), ('forty', 40), ('fifty', 50)) as threshold (kind, pounds)),
	counts as (select * from (values ('hundred_fish', 100), ('five_hundred_fish', 500)) as tally (kind, fish))
	select weights.kind, (select min(caught_at) from mine where weight_lb >= weights.pounds) from weights
	union all
	select counts.kind, (select caught_at from mine order by caught_at offset counts.fish - 1 limit 1) from counts
	union all
	select 'first_record', (
		select min(mine.caught_at) from mine
		where mine.weight_lb > coalesce((
			select max(earlier.weight_lb) from public.catches as earlier
			where earlier.lake_id = mine.lake_id and earlier.angler_id is not null and earlier.caught_at < mine.caught_at
		), 0)
	);
$$;

do $schedules$
begin
	if not exists (select 1 from pg_extension where extname = 'pg_cron') then return; end if;
	perform cron.unschedule('close-ended-matches');
end
$schedules$;

drop function public.close_ended_bounties();
drop function public.bounty_winner_of(public.bounties);
drop function public.try_bounties_on_catch(uuid);
drop function public.settle_bounty(uuid, uuid, uuid);
drop function public.pay_stocked_fish(uuid, public.bounties);
drop function public.pay_peg_at_a_legend(uuid, public.bounties);
drop function public.pay_prize_tackle(uuid, public.bounties);
drop function public.post_bounty(uuid, text, text, uuid, numeric, numeric, timestamptz);
drop function public.open_bounty(uuid, uuid, text, text, text, uuid, text, numeric, text, uuid, text, numeric, text, text, numeric, text, timestamptz, timestamptz);

drop function public.match_winners(text, integer);
drop function public.close_ended_matches();
drop function public.close_match(uuid);
drop function public.cancel_match(uuid);
drop function public.call_off_match(public.matches, text);
drop function public.pay_match_prizes(public.matches, numeric);
drop function public.tell_the_field(public.matches);
drop function public.award_trophy(public.matches, record, text, numeric);
drop function public.match_board(uuid);
drop function public.book_match(uuid, text, integer, integer, numeric, numeric, integer);
drop function public.announce_match(uuid);
drop function public.booking_fee_for(public.lakes, uuid, integer);
drop function public.assert_match_terms(text, integer, integer, numeric, numeric, integer);
drop function public.enter_match(uuid);
drop function public.is_in_match(uuid, uuid);
drop function public.running_match_at(uuid);

alter table public.prototypes drop column bounty_id;
drop table public.bounties;
drop table public.trophies;
drop table public.match_entries;
drop table public.matches;

delete from public.awards where award_key in ('a_match_won', 'first_bounty');
delete from public.notifications where kind in ('match_booked', 'match_cancelled', 'match_won', 'match_over', 'bounty_posted', 'bounty_won');
delete from public.world_events where kind in ('match_announced', 'match_won', 'bounty_posted', 'bounty_won');

alter table public.notifications drop constraint notifications_kind_check;
alter table public.notifications add constraint notifications_kind_check check (kind in (
	'outbid', 'won', 'sold', 'unsold', 'arrived', 'quarantine_over', 'works_complete', 'record_set', 'big_catch_on_your_water', 'fish_died',
	'record_lost', 'board_place_lost', 'award_won', 'prototype_lost'
));
alter table public.world_events drop constraint world_events_kind_check;
alter table public.world_events add constraint world_events_kind_check check (kind in (
	'big_catch', 'sale', 'record', 'new_water', 'island_built', 'fish_died', 'handover', 'award', 'prototype_lost'
));
