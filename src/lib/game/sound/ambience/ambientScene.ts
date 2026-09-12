import { isNightAt } from '$lib/domain/world/hourOfDay';
import type { SeasonName } from '$lib/domain/world/worldClock';
import type { StageConditions } from '../../sky/stageConditions';

export interface AmbientScene {
	birdDensity: number;
	wind: number;
	water: number;
	rain: number;
	isNight: boolean;
}

const BirdsByHour: [fromHour: number, density: number][] = [
	[0, 0],
	[4.5, 0.35],
	[5.5, 1],
	[8.5, 0.7],
	[11, 0.45],
	[15, 0.55],
	[17.5, 0.8],
	[20.5, 0.2],
	[21.5, 0]
];
const BirdsBySeason: Record<SeasonName, number> = { winter: 0.4, spring: 1.1, summer: 0.9, autumn: 0.7 };
const Birds = { InRain: 0.3, InMist: 0.6 } as const;
const Water = { Still: 0.45, WindShare: 0.55 } as const;

export function ambientSceneFor(conditions: StageConditions): AmbientScene {
	const wind = conditions.weather.windStrength;
	return {
		birdDensity: Math.min(1, birdDensityAt(conditions.hour) * BirdsBySeason[conditions.season] * weatherDampening(conditions.weather.kind)),
		wind,
		water: Water.Still + wind * Water.WindShare,
		rain: conditions.weather.kind === 'rain' ? 1 : 0,
		isNight: isNightAt(conditions.hour)
	};
}

function birdDensityAt(hour: number) {
	const band = [...BirdsByHour].reverse().find(([fromHour]) => hour >= fromHour);
	return band ? band[1] : 0;
}

function weatherDampening(kind: StageConditions['weather']['kind']) {
	if (kind === 'rain') return Birds.InRain;
	if (kind === 'mist') return Birds.InMist;
	return 1;
}
