create or replace function public.pay_prize_tackle(winner uuid, bounty public.bounties) returns void
language plpgsql security definer set search_path = public as $$
declare
	fishery_year constant interval := interval '365 hours';
	drum_life constant interval := interval '30 hours';
	number integer;
	item text;
	winner_name text;
begin
	select display_name into winner_name from public.profiles where id = winner;
	if bounty.prize_kind = 'brand_credit' then
		insert into public.tackle_credits (profile_id, brand, amount) values (winner, bounty.prize_brand, bounty.prize_money)
		on conflict (profile_id, brand) do update set amount = public.tackle_credits.amount + excluded.amount;
	elsif bounty.prize_kind = 'sponsorship' then
		insert into public.sponsorships (profile_id, brand, runs_until) values (winner, bounty.prize_brand, now() + fishery_year)
		on conflict (profile_id, brand) do update set runs_until = greatest(public.sponsorships.runs_until, excluded.runs_until);
	elsif bounty.prize_kind = 'prototype' then
		select count(*) + 1 into number from public.prototypes where design_id = bounty.prize_design_id;
		item := bounty.prize_design_id || '-no-' || number;
		insert into public.prototypes (item_id, design_id, brand, number, holder_id, holder_name, bounty_id, fishery_year)
		values (item, bounty.prize_design_id, bounty.prize_brand, number, winner, winner_name, bounty.id, public.fishery_year_now());
		perform public.add_tackle(winner, item, 1, null);
	elsif bounty.prize_kind = 'bait_drum' then
		perform public.add_tackle(winner, bounty.prize_item_id, bounty.prize_quantity, now() + drum_life);
	else
		perform public.add_tackle(winner, bounty.prize_item_id, bounty.prize_quantity, null);
	end if;
end;
$$;

create or replace function public.pay_peg_at_a_legend(winner uuid, bounty public.bounties) returns boolean
language plpgsql security definer set search_path = public as $$
declare
	legend uuid;
	peg uuid;
	product uuid;
begin
	select water.id into legend from public.lakes as water
	where water.is_public and water.is_setup_complete and water.id <> bounty.lake_id and (water.is_booking_on or water.syndicate_price > 0)
	order by (select max(weight_lb) from public.carp where lake_id = water.id) desc nulls last limit 1;
	if legend is null then return false; end if;
	select id into peg from public.swims where lake_id = legend and id not in (select swim_id from public.bookings where fishery_day = public.fishery_day_now() + 1 and status = 'booked') limit 1;
	select id into product from public.ticket_products where lake_id = legend and is_on_sale order by price desc limit 1;
	if peg is null or product is null then return false; end if;
	insert into public.bookings (lake_id, swim_id, angler_id, ticket_product_id, fishery_day, fee_paid) values (legend, peg, winner, product, public.fishery_day_now() + 1, 0);
	return true;
end;
$$;

create or replace function public.pay_stocked_fish(winner uuid, bounty public.bounties) returns boolean
language plpgsql security definer set search_path = public as $$
declare
	stocked_lb constant numeric := 30;
	stocked_age constant integer := 9;
	stocked_condition constant numeric := 85;
	quarantine constant interval := interval '2 hours';
	water uuid;
	fish_name text;
begin
	select id into water from public.lakes where owner_id = winner and is_setup_complete order by created_at limit 1;
	if water is null then return false; end if;
	fish_name := 'The ' || initcap(bounty.sponsor_brand) || ' Mirror';
	insert into public.carp (lake_id, name, strain, weight_lb, age_years, condition, times_caught, origin, origin_lake_id, fame, is_catalogued, transit_until, quarantine_until)
	values (water, fish_name, 'mirror', stocked_lb, stocked_age, stocked_condition, 0, 'farm', null, 0, true, null, now() + quarantine);
	insert into public.carp_transfers (carp_id, carp_name, kind, to_lake_id, price, departed_at, arrives_at, quarantine_until)
	values ((select id from public.carp where lake_id = water and name = fish_name order by id desc limit 1), fish_name, 'farm_delivery', water, 0, now(), now(), now() + quarantine);
	return true;
end;
$$;

revoke execute on function public.pay_prize_tackle(uuid, public.bounties), public.pay_peg_at_a_legend(uuid, public.bounties), public.pay_stocked_fish(uuid, public.bounties) from public, anon, authenticated;
