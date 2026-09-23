import { FisheryClock } from '../simulation/elapsedDays';
import { OpenWater } from '../stock/stockedToOpen';
import type { Lake } from '../types';

export const SponsorsWant = { WaterRating: 50, FisheryDaysOpen: 30, Fish: OpenWater.FewestFish } as const;

export interface WaterStanding {
	waterRating: number;
	fisheryDaysOpen: number;
	fishCount: number;
}

export function fisheryDaysOpenSince(lake: Pick<Lake, 'opened_at'>, now: Date) {
	if (lake.opened_at === null) return 0;
	const openMilliseconds = now.getTime() - new Date(lake.opened_at).getTime();
	return Math.max(0, Math.floor(openMilliseconds / FisheryClock.RealMillisecondsPerFisheryDay));
}

interface Want {
	isMet: boolean;
	words: string;
}

function wantsOf(standing: WaterStanding): Want[] {
	const rating = Math.round(standing.waterRating);
	return [
		{ isMet: standing.waterRating >= SponsorsWant.WaterRating, words: `a rating of ${SponsorsWant.WaterRating} (this water rates ${rating})` },
		{ isMet: standing.fisheryDaysOpen >= SponsorsWant.FisheryDaysOpen, words: `${SponsorsWant.FisheryDaysOpen} fishery days open (${standing.fisheryDaysOpen} so far)` },
		{ isMet: standing.fishCount >= SponsorsWant.Fish, words: `${SponsorsWant.Fish} fish in the water (${standing.fishCount} now)` }
	];
}

export function whatSponsorsStillWant(standing: WaterStanding): string[] {
	return wantsOf(standing)
		.filter((want) => !want.isMet)
		.map((want) => want.words);
}

export function isWorthSponsoring(standing: WaterStanding) {
	return whatSponsorsStillWant(standing).length === 0;
}
