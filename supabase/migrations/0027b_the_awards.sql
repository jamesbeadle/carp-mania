insert into public.awards (profile_id, award_key, won_at)
select angler.id, migrated.award_key, milestone.reached_at
from public.profiles as angler
cross join lateral public.milestones_of(angler.id) as milestone
join (values ('twenty', 'first_twenty'), ('thirty', 'first_thirty'), ('forty', 'first_forty'), ('fifty', 'first_fifty'),
	('first_record', 'first_record'), ('first_trophy', 'a_match_won'), ('hundred_fish', 'hundred_fish'), ('five_hundred_fish', 'five_hundred_fish')) as migrated (kind, award_key)
	on migrated.kind = milestone.kind
where milestone.reached_at is not null
on conflict do nothing;

create or replace function public.award_tallies_of(angler uuid)
returns table (
	best_lb numeric, fish_landed integer, regions_fished integer, home_grown_best_lb numeric, light_rod_best_lb numeric, trophies integer,
	records_set integer, record_waters integer, lifetime_lb numeric, night_fish integer, morning_fish integer, ticket_kinds_fished integer,
	fish_sold integer, bounties_taken integer
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
		(select count(*)::integer from public.trophies where profile_id = angler),
		(select count(*)::integer from public.milestones_of(angler) where kind = 'first_record' and reached_at is not null),
		(select count(*)::integer from public.records_held_by(angler) where scope = 'lake'),
		coalesce((select sum(weight_lb) from mine), 0),
		(select count(*)::integer from mine where hour_of_day is not null and (hour_of_day >= 21 or hour_of_day < 5)),
		(select count(*)::integer from mine where hour_of_day is not null and hour_of_day >= 5 and hour_of_day < 8),
		(select kinds from tickets),
		(select fish from sold),
		(select count(*)::integer from public.bounties where winner_id = angler);
$$;

create or replace function public.grant_award(angler uuid, key text, the_catch uuid, title text, body text) returns boolean
language plpgsql security definer set search_path = public as $$
declare
	award_id uuid;
	angler_name text;
begin
	insert into public.awards (profile_id, award_key, catch_id) values (angler, key, the_catch) on conflict do nothing returning id into award_id;
	if award_id is null then return false; end if;
	select display_name into angler_name from public.profiles where id = angler;
	perform public.send_notification(angler, 'award_won', title, body, '/angler/awards');
	insert into public.world_events (kind, lake_id, payload)
	select 'award', coalesce((select lake_id from public.catches where id = the_catch), (select id from public.lakes where owner_id = angler order by created_at limit 1)),
		jsonb_build_object('awardKey', key, 'awardLabel', title, 'anglerId', angler, 'anglerName', angler_name)
	where exists (select 1 from public.catches where id = the_catch) or exists (select 1 from public.lakes where owner_id = angler);
	return true;
end;
$$;

revoke execute on function public.grant_award(uuid, text, uuid, text, text) from public, anon, authenticated;
grant execute on function public.grant_award(uuid, text, uuid, text, text) to service_role;
grant execute on function public.award_tallies_of(uuid) to authenticated;
