import type { SupabaseClient } from '@supabase/supabase-js';
import { netMoneyFor, type DayOutcome } from '$lib/domain/simulation/simulateOneDay';
import { bigCatchEvent, isBigNpcCatch } from '$lib/domain/simulation/worldEvents';
import type { Lake, Profile } from '$lib/domain/types';
import { settleDayTakings } from '../gates/requireMoney';
import { arrivalNotifications } from './arrivalNotifications';
import { buryTheDead, deathEvents, deathNotifications, deathsIn } from './buryTheDead';
import { persistCompletedWorks } from './persistCompletedWorks';

export async function persistSimulatedDays(trusted: SupabaseClient, finalLake: Lake, outcomes: DayOutcome[], profile: Profile) {
	const finalDay = outcomes[outcomes.length - 1];
	const deaths = deathsIn(outcomes);
	const netMoney = outcomes.reduce((total, day) => total + netMoneyFor(day), 0);

	await trusted.from('lakes').update(finalLake).eq('id', finalLake.id);
	if (finalDay.carp.length > 0) await trusted.from('carp').upsert(finalDay.carp, { onConflict: 'id' });
	await insertSpawnedFry(trusted, outcomes);
	await insertHistory(trusted, outcomes, profile.display_name);
	await buryTheDead(trusted, deaths);
	await settleDayTakings(profile.id, netMoney);
	await insertNews(trusted, finalLake, outcomes, profile);
	await persistCompletedWorks(trusted, finalLake, outcomes, profile.id);
}

async function insertSpawnedFry(trusted: SupabaseClient, outcomes: DayOutcome[]) {
	const fry = outcomes.flatMap((day) => day.spawned);
	if (fry.length > 0) await trusted.from('carp').insert(fry);
}

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
	return bigCatches.map((caught) => bigCatchEvent(lake.id, carpNames.get(caught.carp_id) ?? 'an unknown fish', caught.weight_lb, caught.angler_name));
}
