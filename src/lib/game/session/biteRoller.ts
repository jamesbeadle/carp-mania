import { biteChanceForOneHour, type BiteConditions } from '$lib/domain/fishing/biteChance';
import { FishingDay } from '$lib/domain/fishing/sessionClock';
import { spotBiteFactor } from '$lib/domain/fishing/spotFactor';
import { matchTackleToWater, type TackleMatch } from '$lib/domain/fishing/tackleMatch';
import type { Lake } from '$lib/domain/types';
import type { Season } from '$lib/domain/world/seasons';
import { isCastOut, type CastRod, type RodOnBank } from '../scene/rodState';

export const StrikeWindowSeconds = 4;

function biteConditionsFor(rod: CastRod, season: Season): BiteConditions {
	return { spotFactor: spotBiteFactor(rod.terrain, season), seasonFactor: season.biteFactor };
}

export function biteChanceForOneRealSecond(lake: Lake, rod: CastRod, overallSkill: number, hour: number, season: Season) {
	const match = tackleMatchFor(lake, rod);
	const hourly = biteChanceForOneHour(lake, match.overall, overallSkill, hour, biteConditionsFor(rod, season));
	return 1 - Math.pow(1 - hourly, 1 / FishingDay.RealSecondsPerFishingHour);
}

export function rollForBite(lake: Lake, rod: RodOnBank, overallSkill: number, hour: number, secondsElapsed: number, random: () => number, season: Season) {
	if (rod.phase !== 'cast' || !isCastOut(rod)) return false;
	const perSecond = biteChanceForOneRealSecond(lake, rod, overallSkill, hour, season);
	return random() < perSecond * secondsElapsed;
}

export function tackleMatchFor(lake: Lake, rod: CastRod): TackleMatch {
	return matchTackleToWater(rod.setup, lake, rod.terrain);
}
