import type { WaterToday } from '$lib/domain/fishing/biteRoll';
import type { SessionState } from './sessionState.svelte';

type Today = Pick<SessionState, 'lake' | 'rating' | 'watercraft' | 'season' | 'weather' | 'shoals' | 'difficulty' | 'recentCaptures' | 'nuisanceShare'>;

export function waterTodayOf(session: Today): WaterToday {
	const { lake, rating, watercraft, season, weather, shoals, difficulty, recentCaptures, nuisanceShare } = session;
	return { lake, rating, watercraft, season, weather, shoals, difficulty, recentCaptures, nuisanceShare };
}
