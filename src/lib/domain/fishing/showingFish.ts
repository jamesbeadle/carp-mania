import { seededRandom } from '../random';
import type { Carp } from '../types';
import { mix } from './sessionSeed';

export const ShowingFish = { MostAtOnce: 3, WatercraftShowsFishFrom: 50, StreamSalt: 97 } as const;

export interface Show {
	carp: Carp;
	isTruthful: boolean;
	decoyRoll: number;
}

export function favouriteRevealScore(watercraft: number) {
	return Math.min(1, Math.max(0, watercraft / 100));
}

export function canReadTheWater(watercraft: number) {
	return watercraft >= ShowingFish.WatercraftShowsFishFrom;
}

export function showsThisHour(seed: number, hour: number, carp: Carp[], watercraft: number): Show[] {
	const random = seededRandom(mix(seed, ShowingFish.StreamSalt, Math.floor(hour)));
	const catalogued = carp.filter((fish) => fish.is_catalogued);
	const showing = pickSome(catalogued, ShowingFish.MostAtOnce, random);
	return showing.map((fish) => ({ carp: fish, isTruthful: random() < favouriteRevealScore(watercraft), decoyRoll: random() }));
}

export function idsShownTruthfully(shows: Show[]) {
	const truthful = shows.filter((show) => show.isTruthful);
	return new Set(truthful.map((show) => show.carp.id));
}

function pickSome(items: Carp[], count: number, random: () => number): Carp[] {
	const remaining = [...items];
	const picked: Carp[] = [];
	while (picked.length < count && remaining.length > 0) {
		const index = Math.floor(random() * remaining.length);
		picked.push(...remaining.splice(index, 1));
	}
	return picked;
}
