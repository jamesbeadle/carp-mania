import { showsThisHour } from '$lib/domain/fishing/showingFish';
import type { LayoutPoint } from '$lib/domain/layout/layoutTypes';
import type { Lake } from '$lib/domain/types';
import type { SessionState } from './sessionState.svelte';
import { showingSpotsFor } from './showingFish';

type Water = Pick<Lake, 'layout' | 'plot_acres'>;

export function spotsShowingNow(session: SessionState, water: Water): LayoutPoint[] {
	const hourOfShows = Math.floor(session.hour);
	const shows = showsThisHour(session.seed, hourOfShows, session.carp, session.watercraft);
	return showingSpotsFor(water, shows, session.season);
}
