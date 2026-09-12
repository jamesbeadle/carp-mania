import type { SupabaseClient } from '@supabase/supabase-js';
import { netMoneyFor, type DayOutcome } from '$lib/domain/simulation/simulateOneDay';
import { bigCatchEvent, isBigNpcCatch, recordEvent } from '$lib/domain/simulation/worldEvents';
import type { Lake, Profile } from '$lib/domain/types';
import { settleDayTakings } from '../gates/requireMoney';
import { arrivalNotifications } from './arrivalNotifications';
import { persistCompletedWorks } from './persistCompletedWorks';

export async function persistSimulatedDays(trusted: SupabaseClient, finalLake: Lake, outcomes: DayOutcome[], profile: Profile) {
	const finalDay = outcomes[outcomes.length - 1];
	const takenCarpIds = outcomes.flatMap((day) => day.carpTakenByPike.map((fish) => fish.id));
	const netMoney = outcomes.reduce((total, day) => total + netMoneyFor(day), 0);

	await trusted.from('lakes').update(finalLake).eq('id', finalLake.id);
	if (finalDay.carp.length > 0) await trusted.from('carp').upsert(finalDay.carp, { onConflict: 'id' });
	await insertSpawnedFry(trusted, outcomes);
	await insertHistory(trusted, outcomes);
	if (takenCarpIds.length > 0) await trusted.from('carp').delete().in('id', takenCarpIds);
	await settleDayTakings(profile.id, netMoney);
	await insertNews(trusted, finalLake, outcomes, profile);
	await persistCompletedWorks(trusted, finalLake, outcomes, profile.id);
}

async function insertSpawnedFry(trusted: SupabaseClient, outcomes: DayOutcome[]) {
	const fry = outcomes.flatMap((day) => day.spawned);
	if (fry.length > 0) await trusted.from('carp').insert(fry);
}

async function insertHistory(trusted: SupabaseClient, outcomes: DayOutcome[]) {
	const catches = outcomes.flatMap((day) => day.catches);
	const visits = outcomes.flatMap((day) => day.visits);
	if (visits.length > 0) await trusted.from('lake_visits').insert(visits);
	if (catches.length > 0) await trusted.from('catches').insert(catches);
}

async function insertNews(trusted: SupabaseClient, lake: Lake, outcomes: DayOutcome[], profile: Profile) {
	const notifications = arrivalNotifications(profile.id, outcomes);
	if (notifications.length > 0) await trusted.from('notifications').insert(notifications);
	const events = worldEventsFor(lake, outcomes);
	if (events.length > 0) await trusted.from('world_events').insert(events);
}

function worldEventsFor(lake: Lake, outcomes: DayOutcome[]) {
	const bigCatches = outcomes.flatMap((day) => day.catches.filter((caught) => isBigNpcCatch(caught.weight_lb)));
	const carpNames = new Map(outcomes[outcomes.length - 1].carp.map((fish) => [fish.id, fish.name]));
	const events = bigCatches.map((caught) => bigCatchEvent(lake.id, carpNames.get(caught.carp_id) ?? 'an unknown fish', caught.weight_lb, caught.angler_name));
	const first = outcomes[0].records;
	const last = outcomes[outcomes.length - 1].records;
	if (last.worldRecordLb > first.worldRecordLb) events.push(recordEvent(lake.id, heaviestName(outcomes, last.worldRecordLb), last.worldRecordLb, 'world'));
	else if (last.regionRecordLb > first.regionRecordLb) events.push(recordEvent(lake.id, heaviestName(outcomes, last.regionRecordLb), last.regionRecordLb, 'region'));
	else if (last.lakeRecordLb > first.lakeRecordLb) events.push(recordEvent(lake.id, heaviestName(outcomes, last.lakeRecordLb), last.lakeRecordLb, 'lake'));
	return events;
}

function heaviestName(outcomes: DayOutcome[], weightLb: number) {
	const carpNames = new Map(outcomes[outcomes.length - 1].carp.map((fish) => [fish.id, fish.name]));
	const caught = outcomes.flatMap((day) => day.catches).find((candidate) => Number(candidate.weight_lb) === weightLb);
	return caught ? (carpNames.get(caught.carp_id) ?? 'an unknown fish') : 'an unknown fish';
}
