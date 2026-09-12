import type { Lake } from '$lib/domain/types';
import { hourOfFisheryDay } from '$lib/domain/world/hourOfDay';
import { seasonFor } from '$lib/domain/world/seasons';
import { weatherFor, type Weather } from '$lib/domain/world/weather';
import type { SeasonName } from '$lib/domain/world/worldClock';

export interface StageConditions {
	hour: number;
	season: SeasonName;
	weather: Weather;
}

export function stageConditionsFor(lake: Pick<Lake, 'id' | 'region' | 'latitude'>, now: Date): StageConditions {
	return { hour: hourOfFisheryDay(now), season: seasonFor(lake, now).name, weather: weatherFor(lake, now) };
}
