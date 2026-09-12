import type { SupabaseClient } from '@supabase/supabase-js';
import type { DayOutcome } from '$lib/domain/simulation/simulateOneDay';
import { fishDiedEvent, isRemembered } from '$lib/domain/simulation/worldEvents';
import type { Carp, Lake } from '$lib/domain/types';
import type { NewNotification } from './arrivalNotifications';

export type DeathCause = 'pike' | 'old_age';

export interface Death {
	fish: Carp;
	cause: DeathCause;
}

export function deathsIn(outcomes: DayOutcome[]): Death[] {
	return outcomes.flatMap((day) => [
		...day.carpTakenByPike.map((fish) => ({ fish, cause: 'pike' as const })),
		...day.carpDiedOfOldAge.map((fish) => ({ fish, cause: 'old_age' as const }))
	]);
}

export async function buryTheDead(trusted: SupabaseClient, deaths: Death[]) {
	for (const cause of ['pike', 'old_age'] as const) {
		const ids = deaths.filter((death) => death.cause === cause).map((death) => death.fish.id);
		if (ids.length === 0) continue;
		const { error } = await trusted.rpc('bury_carp', { fish: ids, cause });
		if (error) throw new Error(error.message);
	}
}

export function deathNotifications(profileId: string, deaths: Death[]): NewNotification[] {
	return deaths.map(({ fish, cause }) => ({
		profile_id: profileId,
		kind: 'fish_died',
		title: cause === 'pike' ? `The pike took ${fish.name}` : `${fish.name} has died`,
		body: cause === 'pike' ? `${fish.name} was sick and the pike had it — out of the water for good.` : `${fish.name} died of old age at ${fish.age_years}, ${fish.weight_lb} lb at the last weighing. It goes in the book.`,
		link: `/carp/${fish.id}`
	}));
}

export function deathEvents(lake: Lake, deaths: Death[]) {
	return deaths.filter(({ fish }) => isRemembered(fish)).map(({ fish, cause }) => fishDiedEvent(lake.id, fish.name, Number(fish.weight_lb), fish.age_years, cause));
}
