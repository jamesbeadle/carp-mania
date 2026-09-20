import type { SupabaseClient } from '@supabase/supabase-js';
import { netMoneyFor, type DayOutcome } from '$lib/domain/simulation/simulateOneDay';
import { bigCatchEvent, isBigNpcCatch } from '$lib/domain/simulation/worldEvents';
import type { Lake, Profile } from '$lib/domain/types';
import { settleDayTakings } from '../gates/requireMoney';
import { arrivalNotifications } from './arrivalNotifications';
import { buryTheDead, deathEvents, deathNotifications, deathsIn } from './buryTheDead';
import { persistBounties } from './persistBounties';
import { persistCompletedWorks } from './persistCompletedWorks';
import { persistStock, type StockBefore } from './persistStock';

export async function persistSimulatedDays(trusted: SupabaseClient, finalLake: Lake, outcomes: DayOutcome[], profile: Profile, before: StockBefore) {
	const finalDay = outcomes[outcomes.length - 1];
	const deaths = deathsIn(outcomes);
	const netMoney = outcomes.reduce((total, day) => total + netMoneyFor(day), 0);

	await trusted.from('lakes').update(finalLake).eq('id', finalLake.id);
	await persistStock(trusted, before, { carp: finalDay.carp, shoals: finalDay.shoals });
	const team = finalDay.bailiffs;
	if (team.length > 0) await trusted.from('bailiffs').upsert(team, { onConflict: 'id' });
	await insertHistory(trusted, outcomes, profile.display_name);
	await buryTheDead(trusted, deaths);
	await settleDayTakings(profile.id, netMoney);
	await insertNews(trusted, finalLake, outcomes, profile);
	await persistCompletedWorks(trusted, finalLake, outcomes, profile.id);
	await persistBounties(trusted, finalLake.id, outcomes);
}

const UnknownFish = 'an unknown fish';
const ShoalFish = 'a fish from the shoal';

async function insertHistory(trusted: SupabaseClient, outcomes: DayOutcome[], ownerName: string) {
	const catches = outcomes.flatMap((day) => day.catches).map((caught) => ({ ...caught, owner_name: ownerName }));
	const visits = outcomes.flatMap((day) => day.visits);
	if (visits.length > 0) await trusted.from('lake_visits').insert(visits);
	if (catches.length > 0) await trusted.from('catches').insert(catches);
}

async function insertNews(trusted: SupabaseClient, lake: Lake, outcomes: DayOutcome[], profile: Profile) {
	const deaths = deathsIn(outcomes);
	const notifications = [...arrivalNotifications(profile.id, outcomes), ...deathNotifications(profile.id, deaths)];
	if (notifications.length > 0) await trusted.from('notifications').insert(notifications);
	const events = [...worldEventsFor(lake, outcomes), ...deathEvents(lake, deaths)];
	if (events.length > 0) await trusted.from('world_events').insert(events);
}

function worldEventsFor(lake: Lake, outcomes: DayOutcome[]) {
	const bigCatches = outcomes.flatMap((day) => day.catches.filter((caught) => isBigNpcCatch(caught.weight_lb)));
	const carpNames = new Map(outcomes[outcomes.length - 1].carp.map((fish) => [fish.id, fish.name]));
	const nameOf = (carpId: string | null) => (carpId ? (carpNames.get(carpId) ?? UnknownFish) : ShoalFish);
	return bigCatches.map((caught) => bigCatchEvent(lake.id, nameOf(caught.carp_id), caught.weight_lb, caught.angler_name));
}
