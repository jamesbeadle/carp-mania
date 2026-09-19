import { hourOfDay } from '$lib/domain/fishing/sessionWindow';
import type { Lake } from '$lib/domain/types';
import { seasonFor } from '$lib/domain/world/seasons';
import { weatherFor } from '$lib/domain/world/weather';
import type { StageConditions } from '../sky/stageConditions';

const QuartersInAnHour = 4;

export function sessionConditionsFor(lake: Pick<Lake, 'id' | 'region' | 'latitude'>, visitedAt: string, hour: number): StageConditions {
	const visitDay = new Date(visitedAt);
	return { hour: hourOfDay(hour), season: seasonFor(lake, visitDay).name, weather: weatherFor(lake, visitDay) };
}

export function quarterHourOf(hour: number) {
	return Math.floor(hour * QuartersInAnHour) / QuartersInAnHour;
}
