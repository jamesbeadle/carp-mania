import { biteChanceForOneHour } from '$lib/domain/fishing/biteChance';
import { FishingDay } from '$lib/domain/fishing/sessionClock';
import { matchTackleToWater, type TackleMatch } from '$lib/domain/fishing/tackleMatch';
import type { Lake, Swim } from '$lib/domain/types';
import type { RodOnBank } from '../scene/rodState';

export const StrikeWindowSeconds = 4;

export function biteChanceForOneRealSecond(lake: Lake, swim: Swim, rod: RodOnBank, overallSkill: number, hour: number) {
	const match = matchTackleToWater(rod.setup, lake, swim);
	const hourly = biteChanceForOneHour(lake, match.overall, overallSkill, hour);
	return 1 - Math.pow(1 - hourly, 1 / FishingDay.RealSecondsPerFishingHour);
}

export function rollForBite(lake: Lake, swim: Swim, rod: RodOnBank, overallSkill: number, hour: number, secondsElapsed: number, random: () => number) {
	if (rod.phase !== 'cast') return false;
	const perSecond = biteChanceForOneRealSecond(lake, swim, rod, overallSkill, hour);
	return random() < perSecond * secondsElapsed;
}

export function tackleMatchFor(lake: Lake, swim: Swim, rod: RodOnBank): TackleMatch {
	return matchTackleToWater(rod.setup, lake, swim);
}
