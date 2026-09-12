import type { Lake } from '$lib/domain/types';
import { seasonFor } from '$lib/domain/world/seasons';
import { weatherFor } from '$lib/domain/world/weather';
import { ambientSceneFor, type AmbientScene } from '../sound/ambience/ambientScene';

const QuartersInAnHour = 4;

export function sessionAmbienceFor(lake: Pick<Lake, 'id' | 'region' | 'latitude'>, visitedAt: string, hour: number): AmbientScene {
	const visitDay = new Date(visitedAt);
	return ambientSceneFor({ hour, season: seasonFor(lake, visitDay).name, weather: weatherFor(lake, visitDay) });
}

export function quarterHourOf(hour: number) {
	return Math.floor(hour * QuartersInAnHour) / QuartersInAnHour;
}
