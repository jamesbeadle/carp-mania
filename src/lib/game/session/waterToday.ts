import type { WaterToday } from '$lib/domain/fishing/biteRoll';
import type { SessionState } from './sessionState.svelte';

export function waterTodayOf(session: Pick<SessionState, 'lake' | 'rating' | 'watercraft' | 'season' | 'weather'>): WaterToday {
	const { lake, rating, watercraft, season, weather } = session;
	return { lake, rating, watercraft, season, weather };
}
