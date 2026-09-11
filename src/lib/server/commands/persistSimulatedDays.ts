import type { DayOutcome } from '$lib/domain/simulation/simulateOneDay';
import type { Lake, Profile } from '$lib/domain/types';

export async function persistSimulatedDays(locals: App.Locals, finalLake: Lake, outcomes: DayOutcome[], profile: Profile) {
	const finalDay = outcomes[outcomes.length - 1];
	const takenCarpIds = outcomes.flatMap((day) => day.carpTakenByPike.map((fish) => fish.id));
	const netMoney = outcomes.reduce((total, day) => total + day.feesCollected - day.bailiffWages, 0);

	await locals.supabase.from('lakes').update(finalLake).eq('id', finalLake.id);
	if (finalDay.carp.length > 0) await locals.supabase.from('carp').upsert(finalDay.carp, { onConflict: 'id' });
	await insertHistory(locals, outcomes);
	if (takenCarpIds.length > 0) await locals.supabase.from('carp').delete().in('id', takenCarpIds);
	await locals.supabase.from('profiles').update({ money: Number(profile.money) + netMoney }).eq('id', profile.id);
}

async function insertHistory(locals: App.Locals, outcomes: DayOutcome[]) {
	const catches = outcomes.flatMap((day) => day.catches);
	const visits = outcomes.flatMap((day) => day.visits);
	if (visits.length > 0) await locals.supabase.from('lake_visits').insert(visits);
	if (catches.length > 0) await locals.supabase.from('catches').insert(catches);
}
