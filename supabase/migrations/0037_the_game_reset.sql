-- The game can start again. reset_the_game() keeps every account's sign-in, angler name and avatar and clears
-- everything the angler did with it — the water, the fish, the catches, the tackle, the money, the news — so each
-- angler begins a fresh first generation with the starter kit and the starting purse. This file only defines it;
-- the reset itself is run on purpose, once, as `select public.reset_the_game();` in the SQL editor.

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
		current_lake_id = null, current_fisherman_id = null;

	for angler in select id, display_name from public.profiles loop
		perform public.begin_fisherman(angler.id, angler.display_name, first_generation);
		perform public.grant_starter_kit(angler.id);
	end loop;
end;
$$;

revoke execute on function public.reset_the_game() from public, anon, authenticated;
