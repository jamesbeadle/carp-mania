import type { WaterToday } from '$lib/domain/fishing/biteRoll';
import type { SessionState } from './sessionState.svelte';

export function waterTodayOf(session: Pick<SessionState, 'lake' | 'rating' | 'watercraft' | 'season'>): WaterToday {
	return { lake: session.lake, rating: session.rating, watercraft: session.watercraft, season: session.season };
}
