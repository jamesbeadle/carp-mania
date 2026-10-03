-- Every angler signs a licence before they fish: they make a portrait of themselves on the bank and choose the
-- name they fish under, and only then go looking for a water. The portrait is drawn by the site at
-- /portrait/<look>.svg, so the avatar is still just an address, and a reset sends everyone back to sign again.

alter table public.profiles add column licence_signed_at timestamptz;

create or replace function public.is_portrait_path(candidate text) returns boolean
language sql immutable as $$
	select candidate ~ '^/portrait/[0-5]-[0-4]-[0-5]-[0-2]-[0-4]-[0-5]\.svg$';
$$;

create or replace function public.sign_the_licence(new_name text, portrait text) returns void
language plpgsql security definer set search_path = public as $$
begin
	if auth.uid() is null then raise exception 'No angler is signed in'; end if;
	if not public.is_angler_name(new_name) then raise exception 'An angler name is 3–24 letters and numbers, no spaces'; end if;
	if not public.is_portrait_path(portrait) then raise exception 'That portrait is not one the bank can draw'; end if;
	if exists (select 1 from public.profiles where lower(display_name) = lower(new_name) and id <> auth.uid()) then
		raise exception 'Another angler already fishes as %', new_name;
	end if;
	perform public.follow_the_angler_name(auth.uid(), (select display_name from public.profiles where id = auth.uid()), new_name);
	update public.profiles set avatar_url = portrait, licence_signed_at = now() where id = auth.uid();
end;
$$;
grant execute on function public.sign_the_licence(text, text) to authenticated;

create or replace function public.reset_the_game() returns void
language plpgsql security definer set search_path = public as $$
declare
	first_generation constant integer := 1;
	angler record;
begin
	delete from public.bids;
	delete from public.listings;
	delete from public.carp_transfers;
	delete from public.carp_memorial;
	delete from public.lake_sponsorship_offers;
	delete from public.lake_sponsorships;
	delete from public.syndicate_places;
	delete from public.bookings;
	delete from public.ticket_products;
	delete from public.bailiffs;
	delete from public.lake_species;
	delete from public.carp_shoals;
	delete from public.lake_works;
	delete from public.favourite_lakes;
	delete from public.world_events;
	delete from public.notifications;
	delete from public.catches;
	delete from public.lake_visits;
	delete from public.carp;
	delete from public.swims;
	delete from public.lakes;
	delete from public.awards;
	delete from public.prototypes;
	delete from public.sponsorships;
	delete from public.tackle_credits;
	delete from public.tackle_owned;
	delete from public.rod_sets;
	delete from public.fishermen;

	update public.profiles set
		money = 100000,
		line_selection = 25, rig_selection = 25, bait_selection = 25, watercraft = 25,
		experience = 0,
		saved_rods = '[]'::jsonb,
		home_region = null, plot_region = null, plot_latitude = null, plot_longitude = null,
		current_lake_id = null, current_fisherman_id = null,
		licence_signed_at = null;

	for angler in select id, display_name from public.profiles loop
		perform public.begin_fisherman(angler.id, angler.display_name, first_generation);
		perform public.grant_starter_kit(angler.id);
	end loop;
end;
$$;

revoke execute on function public.reset_the_game() from public, anon, authenticated;
